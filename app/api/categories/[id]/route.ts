import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

function forbiddenResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function parseOptionalInt(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = Number.parseInt(String(value), 10);
  return Number.isNaN(parsed) ? Number.NaN : parsed;
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return forbiddenResponse();
  }

  const { id } = await params;
  const body = await req.json();

  const nom = String(body?.nom ?? "").trim();
  const minPoints = parseOptionalInt(body?.minPoints);
  const maxPoints = parseOptionalInt(body?.maxPoints);
  const maxJoueurs = parseOptionalInt(body?.maxJoueurs);

  if (!nom) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if ([minPoints, maxPoints, maxJoueurs].some((value) => Number.isNaN(value))) {
    return NextResponse.json({ error: "Invalid numeric fields" }, { status: 400 });
  }

  if (minPoints !== null && maxPoints !== null && minPoints > maxPoints) {
    return NextResponse.json({ error: "minPoints must be <= maxPoints" }, { status: 400 });
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      nom,
      minPoints,
      maxPoints,
      maxJoueurs,
    },
  });

  return NextResponse.json(category);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return forbiddenResponse();
  }

  const { id } = await params;

  await prisma.category.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
