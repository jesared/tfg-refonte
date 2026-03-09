import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const existing = await prisma.registration.findUnique({
      where: {
        numeroLicence_tableau: {
          numeroLicence: body.numeroLicence,
          tableau: body.tableau,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Déjà inscrit dans ce tableau." }, { status: 400 });
    }

    await prisma.registration.create({
      data: {
        nom: body.nom,
        prenom: body.prenom,
        numeroLicence: body.numeroLicence,
        genre: body.genre || null,
        club: body.club,
        points: body.points,
        tableau: body.tableau,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
