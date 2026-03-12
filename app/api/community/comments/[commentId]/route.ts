import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { canDeleteCommunityComment, hasAuthenticatedUser } from "@/lib/community/rbac";

export async function DELETE(_: Request, { params }: { params: Promise<{ commentId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!hasAuthenticatedUser(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { commentId } = await params;

  const comment = await prisma.communityComment.findUnique({
    where: { id: commentId },
    select: { id: true, authorId: true },
  });

  if (!comment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  if (!canDeleteCommunityComment(session, comment.authorId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.communityComment.delete({ where: { id: comment.id } });

  return NextResponse.json({ success: true });
}
