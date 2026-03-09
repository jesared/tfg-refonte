import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

function forbiddenResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return forbiddenResponse();
  }

  const tournaments = await prisma.tournament.findMany({
    orderBy: [{ date: "desc" }],
    include: {
      categories: {
        orderBy: { nom: "asc" },
      },
      _count: {
        select: { registrations: true },
      },
    },
  });

  return NextResponse.json(tournaments);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return forbiddenResponse();
  }

  const body = await req.json();

  const tour = Number.parseInt(String(body?.tour ?? ""), 10);
  const nom = `Tour ${tour}`;
  const date = new Date(String(body?.date ?? ""));
  const clubOrganisateur = String(body?.clubOrganisateur ?? "").trim();
  const salleNom = String(body?.salleNom ?? "").trim();
  const salleAdresse = String(body?.salleAdresse ?? "").trim();
  const salleVille = String(body?.salleVille ?? "").trim();

  if (
    !nom ||
    Number.isNaN(tour) ||
    Number.isNaN(date.getTime()) ||
    !clubOrganisateur ||
    !salleNom ||
    !salleAdresse ||
    !salleVille
  ) {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
  }

  const tournament = await prisma.tournament.create({
    data: {
      nom,
      tour,
      date,
      clubOrganisateur,
      salleNom,
      salleAdresse,
      salleVille,
      salleLatitude:
        body?.salleLatitude !== undefined && body?.salleLatitude !== null
          ? Number(body.salleLatitude)
          : null,
      salleLongitude:
        body?.salleLongitude !== undefined && body?.salleLongitude !== null
          ? Number(body.salleLongitude)
          : null,
      sallePlaceId: body?.sallePlaceId ? String(body.sallePlaceId) : null,
      inscriptionOuverte: Boolean(body?.inscriptionOuverte),
    },
  });

  return NextResponse.json(tournament, { status: 201 });
}
