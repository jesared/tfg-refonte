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
  width: number | null;
  height: number | null;
  createdAt: string;
};

export type MediaLibraryQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  mimeType?: string;
  alt?: "all" | "with-alt" | "without-alt";
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "createdAt" | "name" | "size";
  sortOrder?: "asc" | "desc";
};

export type MediaLibraryResult = {
  items: AdminMediaItem[];
  total: number;
  page: number;
  pageSize: number;
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
  width: number | null;
  height: number | null;
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
    width: item.width,
    height: item.height,
    createdAt: item.createdAt.toISOString(),
  };
}

export async function getMediaLibraryAction(query?: MediaLibraryQuery): Promise<MediaLibraryResult> {
  const user = await requireAdmin();

  if (!user) {
    return { items: [], total: 0, page: 1, pageSize: 24 };
  }

  const page = Math.max(1, query?.page ?? 1);
  const pageSize = Math.min(60, Math.max(12, query?.pageSize ?? 24));
  const search = query?.search?.trim();
  const mimeType = query?.mimeType?.trim();
  const alt = query?.alt ?? "all";
  const dateFrom = query?.dateFrom ? new Date(query.dateFrom) : null;
  const dateTo = query?.dateTo ? new Date(query.dateTo) : null;
  const sortBy = query?.sortBy ?? "createdAt";
  const sortOrder = query?.sortOrder ?? "desc";

  const where = {
    ...(search
      ? {
          OR: [{ name: { contains: search, mode: "insensitive" as const } }, { objectKey: { contains: search } }],
        }
      : {}),
    ...(mimeType ? { mimeType } : {}),
    ...(alt === "with-alt"
      ? { altText: { not: null } }
      : alt === "without-alt"
        ? { OR: [{ altText: null }, { altText: "" }] }
        : {}),
    ...((dateFrom || dateTo)
      ? {
          createdAt: {
            ...(dateFrom ? { gte: dateFrom } : {}),
            ...(dateTo ? { lte: new Date(dateTo.getTime() + 24 * 60 * 60 * 1000 - 1) } : {}),
          },
        }
      : {}),
  };

  const orderBy =
    sortBy === "name"
      ? { name: sortOrder }
      : sortBy === "size"
        ? { sizeBytes: sortOrder }
        : { createdAt: sortOrder };

  const total = await prisma.media.count({ where });

  const items = await prisma.media.findMany({
    where,
    orderBy,
    skip: (page - 1) * pageSize,
    take: pageSize,
    select: {
      id: true,
      originalUrl: true,
      thumbnailUrl: true,
      objectKey: true,
      name: true,
      mimeType: true,
      sizeBytes: true,
      altText: true,
      width: true,
      height: true,
      createdAt: true,
    },
  });

  return { items: items.map(mapMedia), total, page, pageSize };
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
        width: true,
        height: true,
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

export async function updateMediaAltManyAction(input: { mediaIds: string[]; alt: string }): Promise<ActionResult> {
  const user = await requireAdmin();

  if (!user) {
    return { ok: false, message: "Non autorisé." };
  }

  const mediaIds = Array.from(new Set(input.mediaIds.filter(Boolean)));

  if (mediaIds.length === 0) {
    return { ok: false, message: "Aucun média sélectionné." };
  }

  await prisma.media.updateMany({
    where: { id: { in: mediaIds } },
    data: { altText: input.alt.trim() || null },
  });

  revalidatePath("/admin/uploads");

  return { ok: true, message: "Texte alternatif mis à jour sur la sélection." };
}

export async function deleteMediaManyAction(mediaIdsInput: string[]): Promise<ActionResult> {
  const user = await requireAdmin();

  if (!user) {
    return { ok: false, message: "Non autorisé." };
  }

  const mediaIds = Array.from(new Set(mediaIdsInput.filter(Boolean)));

  if (mediaIds.length === 0) {
    return { ok: false, message: "Aucun média sélectionné." };
  }

  const media = await prisma.media.findMany({
    where: { id: { in: mediaIds } },
    select: { id: true, objectKey: true, thumbnailObjectKey: true },
  });

  await Promise.allSettled(media.flatMap((item) => [deleteObject(item.objectKey), deleteObject(item.thumbnailObjectKey)]));
  await prisma.media.deleteMany({ where: { id: { in: media.map((item) => item.id) } } });

  revalidatePath("/admin/uploads");

  return { ok: true, message: "Médias supprimés." };
}

export async function updateMediaNameAction(input: { mediaId: string; name: string }): Promise<ActionResult> {
  const user = await requireAdmin();

  if (!user) {
    return { ok: false, message: "Non autorisé." };
  }

  const name = input.name.trim();

  if (!name) {
    return { ok: false, message: "Le nom de fichier ne peut pas être vide." };
  }

  await prisma.media.update({
    where: { id: input.mediaId },
    data: { name },
  });

  revalidatePath("/admin/uploads");

  return { ok: true, message: "Nom du fichier mis à jour." };
}
