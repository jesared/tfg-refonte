import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

function forbiddenResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function parseOptionalInt(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = Number.parseInt(String(value), 10);
  return Number.isNaN(parsed) ? Number.NaN : parsed;
}

function parseTime(value: unknown) {
  const normalized = String(value ?? "").trim();
  if (!normalized) {
    return null;
  }

  const match = normalized.match(/^(\d{2}):(\d{2})$/);
  if (!match) {
    return null;
  }

  const hours = Number.parseInt(match[1], 10);
  const minutes = Number.parseInt(match[2], 10);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  return { hours, minutes };
}

function withTournamentDate(date: Date, hours: number, minutes: number) {
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return forbiddenResponse();
  }

  const body = await req.json();

  const nom = String(body?.nom ?? "").trim();
  const tournamentId = String(body?.tournamentId ?? "").trim();

  if (!nom) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const heureDebut = parseTime(body?.heureDebut);
  const heureFin = parseTime(body?.heureFin);

  if (!heureDebut) {
    return NextResponse.json({ error: "Heure de début invalide" }, { status: 400 });
  }

  if (
    heureFin &&
    (heureFin.hours < heureDebut.hours ||
      (heureFin.hours === heureDebut.hours && heureFin.minutes <= heureDebut.minutes))
  ) {
    return NextResponse.json({ error: "L'heure de fin doit être après l'heure de début" }, { status: 400 });
  }

  const minPoints = parseOptionalInt(body?.minPoints);
  const maxPoints = parseOptionalInt(body?.maxPoints);
  const maxJoueurs = parseOptionalInt(body?.maxJoueurs);

  if ([minPoints, maxPoints, maxJoueurs].some((value) => Number.isNaN(value))) {
    return NextResponse.json({ error: "Invalid numeric fields" }, { status: 400 });
  }

  if (minPoints !== null && maxPoints !== null && minPoints > maxPoints) {
    return NextResponse.json({ error: "minPoints must be <= maxPoints" }, { status: 400 });
  }

  const tournaments = tournamentId
    ? await prisma.tournament.findMany({ where: { id: tournamentId }, select: { id: true, date: true } })
    : await prisma.tournament.findMany({ select: { id: true, date: true } });

  if (tournaments.length === 0) {
    return NextResponse.json({ error: tournamentId ? "Tournament not found" : "No tournament available" }, { status: 400 });
  }

  await prisma.category.createMany({
    data: tournaments.map((tournament) => ({
      nom,
      heureDebut: withTournamentDate(tournament.date, heureDebut.hours, heureDebut.minutes),
      heureFin: heureFin
        ? withTournamentDate(tournament.date, heureFin.hours, heureFin.minutes)
        : null,
      minPoints,
      maxPoints,
      maxJoueurs,
      tournamentId: tournament.id,
    })),
  });

  return NextResponse.json({ created: tournaments.length }, { status: 201 });
}
