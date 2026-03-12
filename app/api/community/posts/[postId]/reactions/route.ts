import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { hasAuthenticatedUser } from "@/lib/community/rbac";
import { ValidationError, parseCreateReactionDto } from "@/lib/community/validation";

export async function GET(_: Request, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;

  const grouped = await prisma.communityReaction.groupBy({
    by: ["type"],
    where: { postId },
    _count: { _all: true },
  });

  return NextResponse.json({ data: grouped });
}

export async function POST(req: Request, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!hasAuthenticatedUser(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await params;
    const dto = parseCreateReactionDto(await req.json());

    const postExists = await prisma.communityPost.findUnique({ where: { id: postId }, select: { id: true } });
    if (!postExists) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const existing = await prisma.communityReaction.findFirst({
      where: {
        postId,
        authorId: session.user.id,
        type: dto.type,
      },
      select: { id: true },
    });

    if (existing) {
      await prisma.communityReaction.delete({ where: { id: existing.id } });
      return NextResponse.json({ data: { active: false, type: dto.type } });
    }

    await prisma.communityReaction.create({
      data: {
        postId,
        authorId: session.user.id,
        type: dto.type,
      },
    });

    return NextResponse.json({ data: { active: true, type: dto.type } }, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
