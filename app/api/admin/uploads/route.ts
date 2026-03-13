import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import sharp from "sharp";

import { uploadObject, buildMediaKeys } from "@/lib/media-storage";
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

  if (!session?.user || session.user.role !== "ADMIN") {
    return unauthorized();
  }

  const formData = await req.formData();
  const file = formData.get("file");
  const altText = String(formData.get("altText") ?? "").trim() || null;
  const sourceRef = String(formData.get("sourceRef") ?? "").trim() || null;

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
    const keys = buildMediaKeys(basename);

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
        mimeType: "image/webp",
        sizeBytes: optimizedOriginal.byteLength,
        width: metadata.width ?? null,
        height: metadata.height ?? null,
        altText,
        sourceRef,
      },
      select: {
        id: true,
        originalUrl: true,
        thumbnailUrl: true,
        sizeBytes: true,
        width: true,
        height: true,
        createdAt: true,
        altText: true,
        sourceRef: true,
      },
    });

    return NextResponse.json({ media }, { status: 201 });
  } catch (error) {
    console.error("[admin/uploads] Upload failed", error);
    return NextResponse.json(
      {
        error:
          "Upload impossible côté serveur (stockage ou configuration). Vérifie SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY et SUPABASE_STORAGE_BUCKET.",
      },
      { status: 500 },
    );
  }
}
