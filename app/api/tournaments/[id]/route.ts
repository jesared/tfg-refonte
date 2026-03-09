import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

function forbiddenResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return forbiddenResponse();
  }

  const { id } = await params;

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      categories: { orderBy: { nom: "asc" } },
      registrations: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!tournament) {
    return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
  }

  return NextResponse.json(tournament);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return forbiddenResponse();
  }

  const { id } = await params;
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

  const existing = await prisma.tournament.findUnique({ where: { id }, select: { id: true } });

  if (!existing) {
    return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
  }

  const tournament = await prisma.tournament.update({
    where: { id },
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

  return NextResponse.json(tournament);
}
