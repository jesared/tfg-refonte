import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

function forbiddenResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

const parseOptionalInt = (value: unknown) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = Number.parseInt(String(value), 10);
  return Number.isNaN(parsed) ? Number.NaN : parsed;
};

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

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return forbiddenResponse();
  }

  const { id } = await params;
  const body = await req.json();

  const nom = String(body?.nom ?? "").trim();

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
    return NextResponse.json(
      { error: "L'heure de fin doit être après l'heure de début" },
      { status: 400 },
    );
  }

  const category = await prisma.category.findUnique({ where: { id }, select: { id: true, nom: true } });

  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const minPoints = parseOptionalInt(body?.minPoints);
  const maxPoints = parseOptionalInt(body?.maxPoints);
  const hasMaxJoueursField = Object.prototype.hasOwnProperty.call(body ?? {}, "maxJoueurs");
  const maxJoueurs = hasMaxJoueursField ? parseOptionalInt(body?.maxJoueurs) : null;

  if ([minPoints, maxPoints].some((value) => Number.isNaN(value))) {
    return NextResponse.json({ error: "Invalid numeric fields" }, { status: 400 });
  }

  if (hasMaxJoueursField && Number.isNaN(maxJoueurs)) {
    return NextResponse.json({ error: "Invalid numeric fields" }, { status: 400 });
  }

  if (minPoints !== null && maxPoints !== null && minPoints > maxPoints) {
    return NextResponse.json({ error: "minPoints must be <= maxPoints" }, { status: 400 });
  }

  const categoriesToUpdate = await prisma.category.findMany({
    where: { nom: category.nom },
    select: { id: true, tournament: { select: { date: true } } },
  });

  const updates = await prisma.$transaction(
    categoriesToUpdate.map((item) =>
      prisma.category.update({
        where: { id: item.id },
        data: {
          nom,
          heureDebut: withTournamentDate(
            item.tournament.date,
            heureDebut.hours,
            heureDebut.minutes,
          ),
          heureFin: heureFin
            ? withTournamentDate(item.tournament.date, heureFin.hours, heureFin.minutes)
            : null,
          minPoints,
          maxPoints,
        },
      }),
    ),
  );

  if (hasMaxJoueursField) {
    await prisma.category.update({
      where: { id },
      data: { maxJoueurs },
    });
  }

  return NextResponse.json({
    updated: updates.length,
    maxJoueursUpdatedForRound: hasMaxJoueursField,
  });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return forbiddenResponse();
  }

  const { id } = await params;

  const category = await prisma.category.findUnique({ where: { id }, select: { id: true } });

  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const linkedRegistrations = await prisma.engagement.count({
    where: {
      categoryIds: { has: category.id },
    },
  });

  if (linkedRegistrations > 0) {
    return NextResponse.json(
      { error: "Impossible de supprimer cette catégorie car des inscriptions existent." },
      { status: 400 },
    );
  }

  await prisma.category.delete({ where: { id: category.id } });

  return NextResponse.json({ deleted: 1 });
}
