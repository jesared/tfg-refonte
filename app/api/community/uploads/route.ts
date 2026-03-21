import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import sharp from "sharp";

import { deleteObject, uploadObject, buildMediaKeys } from "@/lib/media-storage";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return unauthorized();
  }

  const formData = await req.formData();
  const file = formData.get("file");
  const altText = String(formData.get("altText") ?? "").trim() || null;

  if (!(file instanceof File)) {
    return badRequest("Fichier manquant");
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return badRequest("Type non supporté. Utilisez JPG, PNG, WEBP ou AVIF.");
  }

  if (file.size > MAX_FILE_SIZE) {
    return badRequest("Fichier trop volumineux (maximum 8 Mo).");
  }

  try {
    const sourceBuffer = Buffer.from(await file.arrayBuffer());

    const originalSharp = sharp(sourceBuffer, { failOn: "none" }).rotate();
    const metadata = await originalSharp.metadata();

    const optimizedOriginal = await originalSharp
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    const thumbnailBuffer = await sharp(sourceBuffer, { failOn: "none" })
      .rotate()
      .resize({ width: 420, height: 420, fit: "cover", position: "attention" })
      .webp({ quality: 78 })
      .toBuffer();

    const basename = `${Date.now()}-${randomUUID()}`;
    const keys = buildMediaKeys(basename, { prefix: "community-media" });

    const [originalUpload, thumbnailUpload] = await Promise.all([
      uploadObject({
        key: keys.originalKey,
        body: optimizedOriginal,
        contentType: "image/webp",
      }),
      uploadObject({
        key: keys.thumbnailKey,
        body: thumbnailBuffer,
        contentType: "image/webp",
      }),
    ]);

    const media = await prisma.media.create({
      data: {
        uploaderId: session.user.id,
        bucket: originalUpload.bucket,
        objectKey: keys.originalKey,
        thumbnailObjectKey: keys.thumbnailKey,
        originalUrl: originalUpload.publicUrl,
        thumbnailUrl: thumbnailUpload.publicUrl,
        name: file.name,
        mimeType: "image/webp",
        sizeBytes: optimizedOriginal.byteLength,
        width: metadata.width ?? null,
        height: metadata.height ?? null,
        altText,
        sourceRef: "community-post",
      },
      select: {
        id: true,
        originalUrl: true,
        thumbnailUrl: true,
      },
    });

    return NextResponse.json(
      {
        imageUrl: media.originalUrl,
        mediaId: media.id,
        thumbnailUrl: media.thumbnailUrl,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[community/uploads] Upload failed", error);
    return NextResponse.json(
      {
        error:
          "Upload impossible côté serveur (stockage ou configuration). Vérifie SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY et SUPABASE_STORAGE_BUCKET.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return unauthorized();
  }

  let payload: { mediaId?: unknown };
  try {
    payload = (await req.json()) as { mediaId?: unknown };
  } catch {
    return badRequest("Payload JSON invalide");
  }

  const mediaId = String(payload.mediaId ?? "").trim();
  if (!mediaId) {
    return badRequest("mediaId manquant");
  }

  const media = await prisma.media.findUnique({
    where: { id: mediaId },
    select: {
      id: true,
      uploaderId: true,
      objectKey: true,
      thumbnailObjectKey: true,
    },
  });

  if (!media) {
    return NextResponse.json({ error: "Média introuvable" }, { status: 404 });
  }

  const isOwner = media.uploaderId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await Promise.allSettled([deleteObject(media.objectKey), deleteObject(media.thumbnailObjectKey)]);
    await prisma.media.delete({ where: { id: media.id } });

    return NextResponse.json({ deletedId: media.id }, { status: 200 });
  } catch (error) {
    console.error("[community/uploads] Delete failed", error);
    return NextResponse.json({ error: "Suppression impossible côté serveur." }, { status: 500 });
  }
}
