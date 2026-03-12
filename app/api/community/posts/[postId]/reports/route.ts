import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { hasAuthenticatedUser } from "@/lib/community/rbac";
import { ValidationError, parseCreateReportDto } from "@/lib/community/validation";

export async function POST(req: Request, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!hasAuthenticatedUser(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await params;
    const dto = parseCreateReportDto(await req.json());

    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.authorId === session.user.id) {
      return NextResponse.json({ error: "You cannot report your own post" }, { status: 400 });
    }

    const report = await prisma.communityReport.create({
      data: {
        postId,
        reporterId: session.user.id,
        reason: dto.reason,
        details: dto.details,
      },
    });

    return NextResponse.json({ data: report }, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
