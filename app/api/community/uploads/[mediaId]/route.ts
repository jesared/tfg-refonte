import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { deleteObject } from "@/lib/media-storage";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function DELETE(_: Request, context: { params: Promise<{ mediaId: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return unauthorized();
  }

  const { mediaId } = await context.params;
  if (!mediaId) {
    return NextResponse.json({ error: "Identifiant média manquant." }, { status: 400 });
  }

  const media = await prisma.media.findUnique({
    where: { id: mediaId },
    select: {
      id: true,
      uploaderId: true,
      sourceRef: true,
      objectKey: true,
      thumbnailObjectKey: true,
    },
  });

  if (!media || media.uploaderId !== session.user.id || media.sourceRef !== "community-post") {
    return NextResponse.json({ error: "Média introuvable." }, { status: 404 });
  }

  await Promise.allSettled([deleteObject(media.objectKey), deleteObject(media.thumbnailObjectKey)]);
  await prisma.media.delete({ where: { id: media.id } });

  return NextResponse.json({ deletedId: media.id }, { status: 200 });
}
