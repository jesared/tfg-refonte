import fs from "node:fs/promises";
import path from "node:path";

import { unstable_noStore as noStore } from "next/cache";

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

export async function getAgendaTours(): Promise<AgendaTour[]> {
  noStore();

  for (const filePath of [AGENDA_FILE_PATH, TMP_AGENDA_FILE_PATH]) {
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
    await fs.writeFile(AGENDA_FILE_PATH, payload, "utf-8");
    return { usedTemporaryStorage: false };
  } catch (error) {
    if (!isReadOnlyFsError(error)) {
      throw error;
    }
  }

  await fs.writeFile(TMP_AGENDA_FILE_PATH, payload, "utf-8");
  return { usedTemporaryStorage: true };
}
