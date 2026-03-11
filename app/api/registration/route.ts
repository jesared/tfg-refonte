import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

const LICENCE_REGEX = /^[A-Za-z0-9]{3,9}$/;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Vous devez être connecté pour inscrire un joueur." },
      { status: 401 },
    );
  }

  const body = await req.json();

  const nom = String(body?.nom ?? "").trim();
  const prenom = String(body?.prenom ?? "").trim();
  const numeroLicence = String(body?.numeroLicence ?? "").trim().toUpperCase();
  const club = String(body?.club ?? "").trim();
  const genre = body?.genre === "M" || body?.genre === "F" ? body.genre : null;
  const tournamentId = String(body?.tournamentId ?? "").trim();
  const categoryIds = Array.isArray(body?.categoryIds)
    ? body.categoryIds.map((id: unknown) => String(id).trim()).filter(Boolean)
    : [];

  const points =
    body?.points === null || body?.points === undefined || body?.points === ""
      ? null
      : Number.parseInt(String(body.points), 10);

  if (!nom || !prenom || !numeroLicence || !club || !tournamentId || categoryIds.length === 0) {
    return NextResponse.json({ error: "Champs obligatoires manquants." }, { status: 400 });
  }

  if (!LICENCE_REGEX.test(numeroLicence)) {
    return NextResponse.json(
      { error: "Le numéro de licence doit contenir entre 3 et 9 caractères alphanumériques." },
      { status: 400 },
    );
  }

  if (points !== null && (Number.isNaN(points) || points < 0)) {
    return NextResponse.json({ error: "Le nombre de points est invalide." }, { status: 400 });
  }

  const tournament = await prisma.tournament.findFirst({
    where: { id: tournamentId, inscriptionOuverte: true },
    select: { id: true, tour: true },
  });

  if (!tournament) {
    return NextResponse.json(
      { error: "Le tournoi sélectionné n'accepte pas les inscriptions." },
      { status: 400 },
    );
  }

  const existingRegistrationOnTour = await prisma.engagement.findFirst({
    where: {
      numeroLicence,
      tournament: {
        tour: tournament.tour,
      },
    },
    select: { id: true },
  });

  if (existingRegistrationOnTour) {
    return NextResponse.json(
      { error: "Cette licence est déjà inscrite sur ce tour." },
      { status: 409 },
    );
  }

  const categoriesCount = await prisma.category.count({
    where: { id: { in: categoryIds }, tournamentId },
  });

  if (categoriesCount !== categoryIds.length) {
    return NextResponse.json(
      { error: "Au moins un tableau sélectionné est invalide." },
      { status: 400 },
    );
  }

  await prisma.engagement.create({
    data: {
      nom,
      prenom,
      numeroLicence,
      club,
      genre,
      points,
      tournamentId,
      categoryIds: Array.from(new Set(categoryIds)),
      userId: session.user.id,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });

}
