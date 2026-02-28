import { promises as fs } from "node:fs";
import path from "node:path";
import { unstable_noStore as noStore } from "next/cache";

import { prisma } from "@/lib/prisma";

export type Tableau = {
  id: number;
  title: string;
  points: string;
  start: string;
};

const TABLEAUX_FILE_PATH = path.join(process.cwd(), "data", "tableaux.json");
const TMP_TABLEAUX_FILE_PATH = "/tmp/tableaux.json";
const ENV_TABLEAUX_FILE_PATH = process.env.TABLEAUX_FILE_PATH?.trim();

const defaultTableaux: Tableau[] = [
  { id: 1, title: "Tableau 1", points: "2000 à 1600 pts", start: "08h30" },
  { id: 2, title: "Tableau 2", points: "1599 à 1300 pts", start: "09h15" },
  { id: 3, title: "Tableau 3", points: "1299 à 1000 pts", start: "10h00" },
  { id: 4, title: "Tableau 4", points: "999 à 800 pts", start: "10h45" },
  { id: 5, title: "Tableau 5", points: "799 à 600 pts", start: "11h30" },
  { id: 6, title: "Tableau 6", points: "599 à 500 pts", start: "13h30" },
  { id: 7, title: "Tableau 7", points: "499 à 300 pts", start: "14h15" },
  { id: 8, title: "Tableau 8", points: "299 pts et moins", start: "15h00" },
];

const isTableau = (item: unknown): item is Tableau => {
  if (typeof item !== "object" || item === null) {
    return false;
  }

  const tableau = item as Record<string, unknown>;
  return (
    typeof tableau.id === "number" &&
    typeof tableau.title === "string" &&
    typeof tableau.points === "string" &&
    typeof tableau.start === "string"
  );
};

const sanitizeTableaux = (data: unknown): Tableau[] => {
  if (!Array.isArray(data)) {
    return defaultTableaux;
  }

  const tableaux = data
    .filter(isTableau)
    .map((tableau) => ({
      id: tableau.id,
      title: tableau.title.trim(),
      points: tableau.points.trim(),
      start: tableau.start.trim(),
    }))
    .filter((tableau) => tableau.title && tableau.points && tableau.start);

  if (tableaux.length === 0) {
    return defaultTableaux;
  }

  return tableaux.sort((a, b) => a.id - b.id);
};

type TableauDbMapping = {
  id: string;
  title: string;
  points: string;
  start: string;
};

const TABLEAU_TABLE_NAME = "Tableau";

const TABLEAU_DB_KEY_ALIASES: Record<keyof TableauDbMapping, string[]> = {
  id: ["id", "Id"],
  title: ["title", "nom", "name", "intitule"],
  points: ["points", "plagePoints", "plage_points", "range"],
  start: ["start", "heureDebut", "heure_debut", "startTime", "horaire"],
};

const quoteIdentifier = (identifier: string): string => `"${identifier.replaceAll('"', '""')}"`;

const resolveTableauDbMapping = async (): Promise<TableauDbMapping | null> => {
  try {
    const columns = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = ${TABLEAU_TABLE_NAME}
    `;

    if (columns.length === 0) {
      return null;
    }

    const set = new Set(columns.map((column) => column.column_name));

    const pickColumn = (key: keyof TableauDbMapping): string | null => {
      for (const alias of TABLEAU_DB_KEY_ALIASES[key]) {
        if (set.has(alias)) {
          return alias;
        }
      }
      return null;
    };

    const mapping: TableauDbMapping = {
      id: pickColumn("id") ?? "",
      title: pickColumn("title") ?? "",
      points: pickColumn("points") ?? "",
      start: pickColumn("start") ?? "",
    };

    return mapping.id && mapping.title && mapping.points && mapping.start ? mapping : null;
  } catch {
    return null;
  }
};

const getTableauxFromDatabase = async (): Promise<Tableau[] | null> => {
  const mapping = await resolveTableauDbMapping();

  if (!mapping) {
    return null;
  }

  try {
    const rows = await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
      `SELECT * FROM ${quoteIdentifier(TABLEAU_TABLE_NAME)}`,
    );

    return sanitizeTableaux(
      rows.map((row) => ({
        id: Number(row[mapping.id]),
        title: String(row[mapping.title] ?? ""),
        points: String(row[mapping.points] ?? ""),
        start: String(row[mapping.start] ?? ""),
      })),
    );
  } catch {
    return null;
  }
};

const saveTableauxToDatabase = async (tableaux: Tableau[]): Promise<boolean> => {
  const mapping = await resolveTableauDbMapping();

  if (!mapping) {
    return false;
  }

  const cleaned = sanitizeTableaux(tableaux);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`DELETE FROM ${quoteIdentifier(TABLEAU_TABLE_NAME)}`);

      for (const tableau of cleaned) {
        await tx.$executeRawUnsafe(
          `INSERT INTO ${quoteIdentifier(TABLEAU_TABLE_NAME)} (${quoteIdentifier(mapping.id)}, ${quoteIdentifier(mapping.title)}, ${quoteIdentifier(mapping.points)}, ${quoteIdentifier(mapping.start)}) VALUES ($1, $2, $3, $4)`,
          tableau.id,
          tableau.title,
          tableau.points,
          tableau.start,
        );
      }
    });

    return true;
  } catch {
    return false;
  }
};

const getReadPaths = (): string[] => {
  const paths = [ENV_TABLEAUX_FILE_PATH, TMP_TABLEAUX_FILE_PATH, TABLEAUX_FILE_PATH].filter(
    (item): item is string => Boolean(item),
  );

  return [...new Set(paths)];
};

const isReadOnlyFsError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") {
    return false;
  }

  return "code" in error && error.code === "EROFS";
};

export async function getTableaux(): Promise<Tableau[]> {
  noStore();

  const dbTableaux = await getTableauxFromDatabase();
  if (dbTableaux) {
    return dbTableaux;
  }

  for (const filePath of getReadPaths()) {
    try {
      const raw = await fs.readFile(filePath, "utf-8");
      return sanitizeTableaux(JSON.parse(raw));
    } catch {
      continue;
    }
  }

  return defaultTableaux;
}

export async function saveTableaux(tableaux: Tableau[]): Promise<{ usedTemporaryStorage: boolean }> {
  const savedInDatabase = await saveTableauxToDatabase(tableaux);
  if (savedInDatabase) {
    return { usedTemporaryStorage: false };
  }

  const cleaned = sanitizeTableaux(tableaux);
  const payload = `${JSON.stringify(cleaned, null, 2)}\n`;
  const primaryPath = ENV_TABLEAUX_FILE_PATH || TABLEAUX_FILE_PATH;

  try {
    await fs.writeFile(primaryPath, payload, "utf-8");
    return { usedTemporaryStorage: false };
  } catch (error) {
    if (!isReadOnlyFsError(error)) {
      throw error;
    }
  }

  await fs.writeFile(TMP_TABLEAUX_FILE_PATH, payload, "utf-8");
  return { usedTemporaryStorage: true };
}
