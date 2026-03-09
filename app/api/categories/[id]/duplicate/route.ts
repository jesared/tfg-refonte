import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

function forbiddenResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return forbiddenResponse();
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const nom = String(body?.nom ?? "").trim();

  if (!nom) {
    return NextResponse.json({ error: "Le nom de la catégorie est requis." }, { status: 400 });
  }

  const sourceCategory = await prisma.category.findUnique({ where: { id }, select: { nom: true } });

  if (!sourceCategory) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const sourceCategories = await prisma.category.findMany({
    where: { nom: sourceCategory.nom },
    select: {
      heureDebut: true,
      heureFin: true,
      minPoints: true,
      maxPoints: true,
      maxJoueurs: true,
      tournamentId: true,
    },
  });

  if (sourceCategories.length === 0) {
    return NextResponse.json({ error: "Aucune catégorie source trouvée." }, { status: 404 });
  }

  const existingForName = await prisma.category.count({ where: { nom } });

  if (existingForName > 0) {
    return NextResponse.json(
      { error: "Une catégorie avec ce nom existe déjà. Choisissez un autre nom." },
      { status: 400 },
    );
  }

  await prisma.category.createMany({
    data: sourceCategories.map((category) => ({
      nom,
      heureDebut: category.heureDebut,
      heureFin: category.heureFin,
      minPoints: category.minPoints,
      maxPoints: category.maxPoints,
      maxJoueurs: category.maxJoueurs,
      tournamentId: category.tournamentId,
    })),
  });

  return NextResponse.json({ duplicated: sourceCategories.length }, { status: 201 });
}
