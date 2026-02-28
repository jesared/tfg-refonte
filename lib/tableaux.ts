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
const ENV_TABLEAUX_DB_SCHEMA = process.env.TABLEAUX_DB_SCHEMA?.trim();
const ENV_TABLEAUX_DB_TABLE = process.env.TABLEAUX_DB_TABLE?.trim();
const ENV_TABLEAUX_DB_COL_ID = process.env.TABLEAUX_DB_COL_ID?.trim();
const ENV_TABLEAUX_DB_COL_TITLE = process.env.TABLEAUX_DB_COL_TITLE?.trim();
const ENV_TABLEAUX_DB_COL_POINTS = process.env.TABLEAUX_DB_COL_POINTS?.trim();
const ENV_TABLEAUX_DB_COL_START = process.env.TABLEAUX_DB_COL_START?.trim();

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
  schemaName: string;
  tableName: string;
  id: string;
  title: string;
  points: string;
  start: string;
};

const TABLEAU_DB_KEY_ALIASES: Record<"id" | "title" | "points" | "start", string[]> = {
  id: ["id", "numero", "position", "rang", "tableauid", "tableau_id", "numerotableau", "numero_tableau"],
  title: ["title", "nom", "name", "intitule", "libelle", "tableau", "categorie"],
  points: [
    "points",
    "plagepoints",
    "plage_points",
    "range",
    "classement",
    "pointrange",
    "point_min_max",
  ],
  start: ["start", "heuredebut", "heure_debut", "starttime", "horaire", "debut", "heure"],
};

const TABLE_CANDIDATES = ["Tableau", "tableau", "tableaux", "Tableaux", "tableauxtournoi"];

const quoteIdentifier = (identifier: string): string => `"${identifier.replaceAll('"', '""')}"`;

const quoteTable = (schemaName: string, tableName: string): string =>
  `${quoteIdentifier(schemaName)}.${quoteIdentifier(tableName)}`;

const normalize = (value: string): string => value.trim().toLowerCase();

const resolveForcedColumn = (columns: string[], forcedName: string | undefined): string | null => {
  if (!forcedName) {
    return null;
  }

  for (const column of columns) {
    if (normalize(column) === normalize(forcedName)) {
      return column;
    }
  }

  return null;
};

const resolveTableauDbMapping = async (): Promise<TableauDbMapping | null> => {
  try {
    const rows = await prisma.$queryRaw<
      Array<{ table_schema: string; table_name: string; column_name: string }>
    >`
      SELECT table_schema, table_name, column_name
      FROM information_schema.columns
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
    `;

    if (rows.length === 0) {
      return null;
    }

    const candidateSet = new Set(TABLE_CANDIDATES.map((name) => normalize(name)));
    const grouped = new Map<string, { schemaName: string; tableName: string; columns: string[] }>();

    for (const row of rows) {
      const tableKey = `${row.table_schema}.${row.table_name}`;
      const current = grouped.get(tableKey);
      if (!current) {
        grouped.set(tableKey, {
          schemaName: row.table_schema,
          tableName: row.table_name,
          columns: [row.column_name],
        });
      } else {
        current.columns.push(row.column_name);
      }
    }

    const forcedTableCandidates = ENV_TABLEAUX_DB_TABLE
      ? [...grouped.values()].filter((table) =>
          normalize(table.tableName) === normalize(ENV_TABLEAUX_DB_TABLE) &&
          (!ENV_TABLEAUX_DB_SCHEMA || normalize(table.schemaName) === normalize(ENV_TABLEAUX_DB_SCHEMA)),
        )
      : [];

    const namedTableCandidates = [...grouped.values()].filter((table) =>
      candidateSet.has(normalize(table.tableName)),
    );

    const pickColumn = (columns: string[], aliases: string[]): string | null => {
      const aliasSet = new Set(aliases.map((alias) => normalize(alias)));
      for (const column of columns) {
        if (aliasSet.has(normalize(column))) {
          return column;
        }
      }
      return null;
    };

    const mappedTables = [...grouped.values()]
      .map((table) => {
        const mapping = {
          schemaName: table.schemaName,
          tableName: table.tableName,
          id:
            resolveForcedColumn(table.columns, ENV_TABLEAUX_DB_COL_ID) ||
            pickColumn(table.columns, TABLEAU_DB_KEY_ALIASES.id),
          title:
            resolveForcedColumn(table.columns, ENV_TABLEAUX_DB_COL_TITLE) ||
            pickColumn(table.columns, TABLEAU_DB_KEY_ALIASES.title),
          points:
            resolveForcedColumn(table.columns, ENV_TABLEAUX_DB_COL_POINTS) ||
            pickColumn(table.columns, TABLEAU_DB_KEY_ALIASES.points),
          start:
            resolveForcedColumn(table.columns, ENV_TABLEAUX_DB_COL_START) ||
            pickColumn(table.columns, TABLEAU_DB_KEY_ALIASES.start),
        };

        if (mapping.id && mapping.title && mapping.points && mapping.start) {
          return {
            schemaName: mapping.schemaName,
            tableName: mapping.tableName,
            id: mapping.id,
            title: mapping.title,
            points: mapping.points,
            start: mapping.start,
          };
        }

        return null;
      })
      .filter((item): item is TableauDbMapping => item !== null);

    const prioritized = [
      ...forcedTableCandidates.map((table) => `${table.schemaName}.${table.tableName}`),
      ...namedTableCandidates.map((table) => `${table.schemaName}.${table.tableName}`),
    ];

    for (const table of mappedTables) {
      if (prioritized.includes(`${table.schemaName}.${table.tableName}`)) {
        return table;
      }
    }

    for (const table of mappedTables) {
      const mapping = {
        schemaName: table.schemaName,
        tableName: table.tableName,
        id: table.id,
        title: table.title,
        points: table.points,
        start: table.start,
      };

      return {
        schemaName: mapping.schemaName,
        tableName: mapping.tableName,
        id: mapping.id,
        title: mapping.title,
        points: mapping.points,
        start: mapping.start,
      };
    }

    return null;
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
    const tableRef = quoteTable(mapping.schemaName, mapping.tableName);
    const rows = await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
      `SELECT ${quoteIdentifier(mapping.id)} AS id, ${quoteIdentifier(mapping.title)} AS title, ${quoteIdentifier(mapping.points)} AS points, ${quoteIdentifier(mapping.start)} AS start FROM ${tableRef} ORDER BY ${quoteIdentifier(mapping.id)} ASC`,
    );

    return sanitizeTableaux(
      rows.map((row) => ({
        id: Number(row.id),
        title: String(row.title ?? ""),
        points: String(row.points ?? ""),
        start: String(row.start ?? ""),
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
  const tableRef = quoteTable(mapping.schemaName, mapping.tableName);

  try {
    await prisma.$transaction(async (tx) => {
      for (const tableau of cleaned) {
        const updated = await tx.$executeRawUnsafe(
          `UPDATE ${tableRef}
           SET ${quoteIdentifier(mapping.title)} = $1,
               ${quoteIdentifier(mapping.points)} = $2,
               ${quoteIdentifier(mapping.start)} = $3
           WHERE ${quoteIdentifier(mapping.id)} = $4`,
          tableau.title,
          tableau.points,
          tableau.start,
          tableau.id,
        );

        if (updated === 0) {
          await tx.$executeRawUnsafe(
            `INSERT INTO ${tableRef} (${quoteIdentifier(mapping.id)}, ${quoteIdentifier(mapping.title)}, ${quoteIdentifier(mapping.points)}, ${quoteIdentifier(mapping.start)})
             VALUES ($1, $2, $3, $4)`,
            tableau.id,
            tableau.title,
            tableau.points,
            tableau.start,
          );
        }
      }
    });

    return true;
  } catch (error) {
    console.error("[tableaux] Database save failed", error);
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

export async function saveTableaux(tableaux: Tableau[]): Promise<{ usedTemporaryStorage: boolean; databaseAvailable: boolean; storage: "database" | "file" | "tmp" }> {
  const savedInDatabase = await saveTableauxToDatabase(tableaux);
  if (savedInDatabase) {
    return { usedTemporaryStorage: false, databaseAvailable: true, storage: "database" };
  }

  const cleaned = sanitizeTableaux(tableaux);
  const payload = `${JSON.stringify(cleaned, null, 2)}\n`;
  const primaryPath = ENV_TABLEAUX_FILE_PATH || TABLEAUX_FILE_PATH;

  try {
    await fs.writeFile(primaryPath, payload, "utf-8");
    return { usedTemporaryStorage: false, databaseAvailable: false, storage: "file" };
  } catch (error) {
    if (!isReadOnlyFsError(error)) {
      throw error;
    }
  }

  await fs.writeFile(TMP_TABLEAUX_FILE_PATH, payload, "utf-8");
  return { usedTemporaryStorage: true, databaseAvailable: false, storage: "tmp" };
}
