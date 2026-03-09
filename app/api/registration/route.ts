import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();

  const nom = String(body?.nom ?? "").trim();
  const prenom = String(body?.prenom ?? "").trim();
  const numeroLicence = String(body?.numeroLicence ?? "").trim();
  const club = String(body?.club ?? "").trim();
  const genre = body?.genre === "M" || body?.genre === "F" ? body.genre : null;
  const tournamentId = String(body?.tournamentId ?? "").trim();
  const categoryId = String(body?.categoryId ?? "").trim();

  const points =
    body?.points === null || body?.points === undefined || body?.points === ""
      ? null
      : Number.parseInt(String(body.points), 10);

  if (!nom || !prenom || !numeroLicence || !club || !tournamentId || !categoryId) {
    return NextResponse.json({ error: "Champs obligatoires manquants." }, { status: 400 });
  }

  if (points !== null && (Number.isNaN(points) || points < 0)) {
    return NextResponse.json({ error: "Le nombre de points est invalide." }, { status: 400 });
  }

  const tournament = await prisma.tournament.findFirst({
    where: { id: tournamentId, inscriptionOuverte: true },
    select: { id: true },
  });

  if (!tournament) {
    return NextResponse.json({ error: "Le tournoi sélectionné n'accepte pas les inscriptions." }, { status: 400 });
  }

  const category = await prisma.category.findFirst({
    where: { id: categoryId, tournamentId },
    select: { id: true },
  });

  if (!category) {
    return NextResponse.json({ error: "Le tableau sélectionné est invalide pour ce tournoi." }, { status: 400 });
  }

  try {
    await prisma.registration.create({
      data: {
        nom,
        prenom,
        numeroLicence,
        club,
        genre,
        points,
        tournamentId,
        categoryId,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Cette licence est déjà inscrite sur ce tableau." },
        { status: 409 },
      );
    }

    throw error;
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
