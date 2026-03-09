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
  const tournamentId = String(body?.tournamentId ?? "").trim();

  if (!nom || !tournamentId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: { id: true },
  });

  if (!tournament) {
    return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
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

  const category = await prisma.category.create({
    data: {
      nom,
      tournamentId,
      minPoints,
      maxPoints,
      maxJoueurs,
    },
  });

  return NextResponse.json(category, { status: 201 });
}
