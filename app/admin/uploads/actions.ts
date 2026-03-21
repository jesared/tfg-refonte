"use server";

import { randomUUID } from "node:crypto";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import sharp from "sharp";

import { uploadObject, buildMediaKeys, deleteObject } from "@/lib/media-storage";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export type AdminMediaItem = {
  id: string;
  url: string;
  thumbnailUrl: string;
  key: string;
  name: string;
  type: string;
  size: number;
  alt: string | null;
  createdAt: string;
};

type ActionResult = {
  ok: boolean;
  message: string;
};

async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }

  return session.user;
}

function mapMedia(item: {
  id: string;
  originalUrl: string;
  thumbnailUrl: string;
  objectKey: string;
  name: string | null;
  mimeType: string;
  sizeBytes: number;
  altText: string | null;
  createdAt: Date;
}): AdminMediaItem {
  return {
    id: item.id,
    url: item.originalUrl,
    thumbnailUrl: item.thumbnailUrl,
    key: item.objectKey,
    name: item.name ?? "asset",
    type: item.mimeType,
    size: item.sizeBytes,
    alt: item.altText,
    createdAt: item.createdAt.toISOString(),
  };
}

export async function getMediaLibraryAction(): Promise<AdminMediaItem[]> {
  const user = await requireAdmin();

  if (!user) {
    return [];
  }

  const items = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
    take: 60,
    select: {
      id: true,
      originalUrl: true,
      thumbnailUrl: true,
      objectKey: true,
      name: true,
      mimeType: true,
      sizeBytes: true,
      altText: true,
      createdAt: true,
    },
  });

  return items.map(mapMedia);
}

export async function uploadMediaAction(formData: FormData): Promise<ActionResult & { media?: AdminMediaItem }> {
  const user = await requireAdmin();

  if (!user) {
    return { ok: false, message: "Non autorisé." };
  }

  const file = formData.get("file");
  const alt = String(formData.get("alt") ?? "").trim() || null;

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Fichier manquant." };
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return { ok: false, message: "Type non supporté (JPG, PNG, WEBP, AVIF)." };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { ok: false, message: "Fichier trop volumineux (max 8 Mo)." };
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
      .resize({ width: 640, height: 640, fit: "cover", position: "attention" })
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
        uploaderId: user.id,
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
        altText: alt,
      },
      select: {
        id: true,
        originalUrl: true,
        thumbnailUrl: true,
        objectKey: true,
        name: true,
        mimeType: true,
        sizeBytes: true,
        altText: true,
        createdAt: true,
      },
    });

    revalidatePath("/admin/uploads");

    return { ok: true, message: "Upload terminé.", media: mapMedia(media) };
  } catch (error) {
    console.error("[media-library] uploadMediaAction failed", error);
    return { ok: false, message: "Erreur serveur pendant l'upload." };
  }
}

export async function updateMediaAltAction(input: { mediaId: string; alt: string }): Promise<ActionResult> {
  const user = await requireAdmin();

  if (!user) {
    return { ok: false, message: "Non autorisé." };
  }

  await prisma.media.update({
    where: { id: input.mediaId },
    data: { altText: input.alt.trim() || null },
  });

  revalidatePath("/admin/uploads");

  return { ok: true, message: "Texte alternatif mis à jour." };
}

export async function deleteMediaAction(mediaId: string): Promise<ActionResult> {
  const user = await requireAdmin();

  if (!user) {
    return { ok: false, message: "Non autorisé." };
  }

  const media = await prisma.media.findUnique({
    where: { id: mediaId },
    select: { id: true, objectKey: true, thumbnailObjectKey: true },
  });

  if (!media) {
    return { ok: false, message: "Média introuvable." };
  }

  await Promise.allSettled([deleteObject(media.objectKey), deleteObject(media.thumbnailObjectKey)]);
  await prisma.media.delete({ where: { id: mediaId } });

  revalidatePath("/admin/uploads");

  return { ok: true, message: "Média supprimé." };
}
