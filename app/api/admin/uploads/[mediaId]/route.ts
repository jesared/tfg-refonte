import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { deleteObject } from "@/lib/media-storage";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function DELETE(_: Request, context: { params: Promise<{ mediaId: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return unauthorized();
  }

  const { mediaId } = await context.params;

  const media = await prisma.media.findUnique({
    where: { id: mediaId },
    select: { id: true, objectKey: true, thumbnailObjectKey: true },
  });

  if (!media) {
    return NextResponse.json({ error: "Média introuvable." }, { status: 404 });
  }

  await Promise.allSettled([deleteObject(media.objectKey), deleteObject(media.thumbnailObjectKey)]);

  await prisma.media.delete({ where: { id: mediaId } });

  return NextResponse.json({ deletedId: mediaId }, { status: 200 });
}
