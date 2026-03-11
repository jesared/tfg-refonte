import { Prisma } from "@prisma/client";
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
  const categoryIds: string[] = Array.isArray(body?.categoryIds)
    ? body.categoryIds
        .map((id: unknown): string => String(id).trim())
        .filter((id: string) => id.length > 0)
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
    select: { id: true },
  });

  if (!tournament) {
    return NextResponse.json(
      { error: "Le tournoi sélectionné n'accepte pas les inscriptions." },
      { status: 400 },
    );
  }

  const uniqueCategoryIds = Array.from(new Set(categoryIds));
  const categories = await prisma.category.findMany({
    where: { id: { in: uniqueCategoryIds }, tournamentId },
    select: { id: true, minPoints: true, maxPoints: true },
  });

  if (categories.length !== uniqueCategoryIds.length) {
    return NextResponse.json(
      { error: "Au moins un tableau sélectionné est invalide." },
      { status: 400 },
    );
  }

  const isEligible = categories.every((category) => {
    if (points === null) return true;
    return (category.minPoints === null || points >= category.minPoints) &&
      (category.maxPoints === null || points <= category.maxPoints);
  });

  if (!isEligible) {
    return NextResponse.json(
      { error: "Le classement du joueur ne correspond pas à au moins une catégorie sélectionnée." },
      { status: 400 },
    );
  }

  try {
    await prisma.$transaction(async (tx) => {
      const player = await tx.player.upsert({
        where: { numeroLicence },
        update: { nom, prenom, club, genre, points },
        create: { numeroLicence, nom, prenom, club, genre, points },
        select: { id: true },
      });

      const registration = await tx.registration.create({
        data: {
          playerId: player.id,
          tournamentId,
          userId: session.user.id,
          engagements: {
            create: uniqueCategoryIds.map((categoryId) => ({ categoryId })),
          },
        },
        select: { id: true },
      });

      return registration;
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "Cette licence est déjà inscrite sur ce tour." },
        { status: 409 },
      );
    }
    throw error;
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
