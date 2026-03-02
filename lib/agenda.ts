import fs from "node:fs/promises";
import path from "node:path";

import { unstable_noStore as noStore } from "next/cache";

import { prisma } from "@/lib/prisma";

export type AgendaTour = {
  id: number;
  label: string;
  date: string;
  club: string;
  city: string;
  venue: string;
  address: string;
};

const AGENDA_FILE_PATH = path.join(process.cwd(), "data", "agenda.json");
const TMP_AGENDA_FILE_PATH = "/tmp/agenda.json";
const AGENDA_STORAGE_KEY = "agenda_tours";

const sanitizeTours = (input: AgendaTour[]): AgendaTour[] => {
  return input
    .map((tour, index) => ({
      id: Number(tour.id) || index + 1,
      label: String(tour.label ?? "").trim(),
      date: String(tour.date ?? "").trim(),
      club: String(tour.club ?? "").trim(),
      city: String(tour.city ?? "").trim(),
      venue: String(tour.venue ?? "").trim(),
      address: String(tour.address ?? "").trim(),
    }))
    .filter(
      (tour) => tour.label && tour.date && tour.club && tour.city && tour.venue && tour.address,
    )
    .sort((a, b) => a.id - b.id)
    .map((tour, index) => ({ ...tour, id: index + 1 }));
};

const defaultTours: AgendaTour[] = [
  {
    id: 1,
    label: "Tour 1",
    date: "24 août 2025",
    club: "AS Gueux-Tinqueux",
    city: "Gueux",
    venue: "Complexe Sportif de Gueux",
    address: "Rue du Moutier, 51390 Gueux",
  },
];

const isReadOnlyFsError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") {
    return false;
  }

  return "code" in error && error.code === "EROFS";
};

const parseAgendaFromUnknown = (value: unknown): AgendaTour[] | null => {
  if (!Array.isArray(value)) {
    return null;
  }

  return sanitizeTours(value as AgendaTour[]);
};

export async function getAgendaTours(): Promise<AgendaTour[]> {
  noStore();

  try {
    const agenda = await prisma.agendaSetting.findUnique({
      where: { key: AGENDA_STORAGE_KEY },
      select: { value: true },
    });

    const parsed = parseAgendaFromUnknown(agenda?.value);
    if (parsed && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // Fall back to files when DB is unavailable.
  }

  // Read temporary storage first so admin updates remain visible when
  // persistent storage is read-only (EROFS).
  for (const filePath of [TMP_AGENDA_FILE_PATH, AGENDA_FILE_PATH]) {
    try {
      const raw = await fs.readFile(filePath, "utf-8");
      return sanitizeTours(JSON.parse(raw));
    } catch {
      continue;
    }
  }

  return defaultTours;
}

export async function saveAgendaTours(
  tours: AgendaTour[],
): Promise<{ usedTemporaryStorage: boolean }> {
  const cleaned = sanitizeTours(tours);
  const payload = `${JSON.stringify(cleaned, null, 2)}\n`;

  try {
    await prisma.agendaSetting.upsert({
      where: { key: AGENDA_STORAGE_KEY },
      update: { value: cleaned },
      create: { key: AGENDA_STORAGE_KEY, value: cleaned },
    });

    return { usedTemporaryStorage: false };
  } catch {
    // Fall back to file persistence when DB is unavailable.
  }

  try {
    await fs.writeFile(AGENDA_FILE_PATH, payload, "utf-8");

    // When persistent writes start working again, drop stale temporary data so
    // subsequent reads don't keep showing outdated content.
    try {
      await fs.unlink(TMP_AGENDA_FILE_PATH);
    } catch (cleanupError) {
      if (!cleanupError || typeof cleanupError !== "object" || !("code" in cleanupError)) {
        throw cleanupError;
      }

      if (cleanupError.code !== "ENOENT") {
        throw cleanupError;
      }
    }

    return { usedTemporaryStorage: false };
  } catch (error) {
    if (!isReadOnlyFsError(error)) {
      throw error;
    }
  }

  await fs.writeFile(TMP_AGENDA_FILE_PATH, payload, "utf-8");
  return { usedTemporaryStorage: true };
}
