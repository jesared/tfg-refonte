import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { hasAuthenticatedUser } from "@/lib/community/rbac";
import { ValidationError, parseCreateCommentDto } from "@/lib/community/validation";

export async function GET(_: Request, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;

  const comments = await prisma.communityComment.findMany({
    where: { postId },
    orderBy: { createdAt: "asc" },
    include: {
      author: { select: { id: true, name: true, image: true } },
    },
  });

  return NextResponse.json({ data: comments });
}

export async function POST(req: Request, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!hasAuthenticatedUser(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await params;
    const dto = parseCreateCommentDto(await req.json());

    const postExists = await prisma.communityPost.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!postExists) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const comment = await prisma.communityComment.create({
      data: {
        postId,
        authorId: session.user.id,
        content: dto.content,
      },
      include: {
        author: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json({ data: comment }, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
