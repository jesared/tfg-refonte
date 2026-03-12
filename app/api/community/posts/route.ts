import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { hasAuthenticatedUser } from "@/lib/community/rbac";
import { ValidationError, parseCreatePostDto, parsePostsQuery } from "@/lib/community/validation";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const filters = parsePostsQuery(url.searchParams);

    const posts = await prisma.communityPost.findMany({
      where: {
        tournamentId: filters.tournamentId ?? undefined,
        zone: filters.zone ?? undefined,
        status: filters.status ?? undefined,
      },
      orderBy: { publishedAt: "desc" },
      take: filters.limit,
      include: {
        author: { select: { id: true, name: true, image: true } },
        tournament: { select: { id: true, nom: true, tour: true, date: true } },
        _count: { select: { comments: true, reactions: true, reports: true } },
      },
    });

    return NextResponse.json({ data: posts });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!hasAuthenticatedUser(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await req.json();
    const dto = parseCreatePostDto(payload);

    if (dto.tournamentId) {
      const tournament = await prisma.tournament.findUnique({
        where: { id: dto.tournamentId },
        select: { id: true },
      });

      if (!tournament) {
        return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
      }
    }

    const post = await prisma.communityPost.create({
      data: {
        authorId: session.user.id,
        tournamentId: dto.tournamentId,
        title: dto.title,
        content: dto.content,
        imageUrl: dto.imageUrl,
        scope: dto.scope,
        status: dto.status,
        zone: dto.zone,
      },
      include: {
        author: { select: { id: true, name: true, image: true } },
        tournament: { select: { id: true, nom: true, tour: true, date: true } },
      },
    });

    return NextResponse.json({ data: post }, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
