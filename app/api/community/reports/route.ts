import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { canManageCommunityReports } from "@/lib/community/rbac";
import { ValidationError } from "@/lib/community/validation";

function parseLimit(value: string | null) {
  if (!value) {
    return 50;
  }

  const limit = Number.parseInt(value, 10);
  if (!Number.isInteger(limit) || limit <= 0 || limit > 100) {
    throw new ValidationError("Invalid limit (must be between 1 and 100)");
  }

  return limit;
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!canManageCommunityReports(session)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(req.url);
    const limit = parseLimit(url.searchParams.get("limit"));

    const reports = await prisma.communityReport.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        post: {
          select: {
            id: true,
            title: true,
            content: true,
            authorId: true,
          },
        },
        reporter: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ data: reports });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
