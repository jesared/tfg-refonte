import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { canDeleteCommunityPost, hasAuthenticatedUser } from "@/lib/community/rbac";

export async function DELETE(_: Request, { params }: { params: Promise<{ postId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!hasAuthenticatedUser(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { postId } = await params;

  const post = await prisma.communityPost.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  if (!canDeleteCommunityPost(session, post.authorId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.communityPost.delete({ where: { id: post.id } });

  return NextResponse.json({ success: true });
}
