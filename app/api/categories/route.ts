import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

function forbiddenResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return forbiddenResponse();
  }

  const body = await req.json();

  const nom = String(body?.nom ?? "").trim();
  const horaire = String(body?.horaire ?? "").trim();
  const tournamentId = String(body?.tournamentId ?? "").trim();
  if (!nom) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const parseOptionalInt = (value: unknown) => {
    if (value === undefined || value === null || value === "") {
      return null;
    }

    const parsed = Number.parseInt(String(value), 10);
    return Number.isNaN(parsed) ? Number.NaN : parsed;
  };

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
    ? await prisma.tournament.findMany({ where: { id: tournamentId }, select: { id: true } })
    : await prisma.tournament.findMany({ select: { id: true } });

  if (tournaments.length === 0) {
    return NextResponse.json({ error: tournamentId ? "Tournament not found" : "No tournament available" }, { status: 400 });
  }

  await prisma.category.createMany({
    data: tournaments.map((tournament) => ({
      nom,
      horaire: horaire || null,
      minPoints,
      maxPoints,
      maxJoueurs,
      tournamentId: tournament.id,
    })),
  });

  return NextResponse.json({ created: tournaments.length }, { status: 201 });
}
