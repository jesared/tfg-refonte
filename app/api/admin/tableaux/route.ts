import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { getTableaux, saveTableaux, type Tableau } from "@/lib/tableaux";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

const isValidTableau = (value: unknown): value is Tableau => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "number" &&
    Number.isFinite(item.id) &&
    typeof item.title === "string" &&
    item.title.trim().length > 0 &&
    typeof item.points === "string" &&
    item.points.trim().length > 0 &&
    typeof item.start === "string" &&
    item.start.trim().length > 0
  );
};

const ensureAdmin = async (): Promise<boolean> => {
  const session = await getServerSession(authOptions);
  return Boolean(session?.user && session.user.role === "ADMIN");
};

export async function GET() {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tableaux = await getTableaux();
  return NextResponse.json({ tableaux });
}

export async function PUT(request: Request) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  if (!Array.isArray(payload) || !payload.every(isValidTableau)) {
    return NextResponse.json(
      { error: "Payload must be an array of tableaux {id, title, points, start}" },
      { status: 400 },
    );
  }

  const normalized = payload.map((item) => ({
    id: item.id,
    title: item.title.trim(),
    points: item.points.trim(),
    start: item.start.trim(),
  }));

  const result = await saveTableaux(normalized);

  return NextResponse.json({
    ok: true,
    usedTemporaryStorage: result.usedTemporaryStorage,
    databaseAvailable: result.databaseAvailable,
  });
}
