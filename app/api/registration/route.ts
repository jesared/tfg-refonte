import { prisma } from "@/lib/prisma";
import type { Gender } from "@prisma/client";
import { NextResponse } from "next/server";

const VALID_GENRES = new Set<Gender>(["M", "F"]);
const VALID_TABLEAUX = new Set(["0-899", "900-1299", "1300-1599", "1600+"]);

type RegistrationPayload = {
  nom?: unknown;
  prenom?: unknown;
  numeroLicence?: unknown;
  genre?: unknown;
  club?: unknown;
  points?: unknown;
  tableau?: unknown;
};

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RegistrationPayload;

    const nom = asTrimmedString(body.nom);
    const prenom = asTrimmedString(body.prenom);
    const numeroLicence = asTrimmedString(body.numeroLicence);
    const club = asTrimmedString(body.club);
    const tableau = asTrimmedString(body.tableau);
    const genreRaw = asTrimmedString(body.genre);
    const points = typeof body.points === "number" ? body.points : Number.NaN;

    if (!nom || !prenom || !numeroLicence || !club || !tableau) {
      return NextResponse.json({ error: "Champs obligatoires manquants." }, { status: 400 });
    }

    if (!VALID_TABLEAUX.has(tableau)) {
      return NextResponse.json({ error: "Tableau invalide." }, { status: 400 });
    }

    if (!Number.isInteger(points) || points < 0) {
      return NextResponse.json({ error: "Le nombre de points est invalide." }, { status: 400 });
    }

    const genre = genreRaw ? (VALID_GENRES.has(genreRaw as Gender) ? (genreRaw as Gender) : null) : null;
    if (genreRaw && !genre) {
      return NextResponse.json({ error: "Genre invalide." }, { status: 400 });
    }

    const existing = await prisma.registration.findUnique({
      where: {
        numeroLicence_tableau: {
          numeroLicence,
          tableau,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Déjà inscrit dans ce tableau." }, { status: 409 });
    }

    const created = await prisma.registration.create({
      data: {
        nom,
        prenom,
        numeroLicence,
        genre,
        club,
        points,
        tableau,
      },
      select: { id: true },
    });

    return NextResponse.json({ success: true, id: created.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
