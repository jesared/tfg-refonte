import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminImageUploadForm } from "@/components/admin/AdminImageUploadForm";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export const metadata: Metadata = {
  title: "Admin - Upload d'images",
  description: "Ajout d'images administrateur pour les contenus du site.",
};

export default async function AdminUploadsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  let media: Array<{
    id: string;
    originalUrl: string;
    thumbnailUrl: string;
    sizeBytes: number;
    width: number | null;
    height: number | null;
    createdAt: Date;
    altText: string | null;
    sourceRef: string | null;
  }> = [];
  let dbError: string | null = null;

  try {
    media = await prisma.media.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
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
  } catch (error) {
    dbError = error instanceof Error ? error.message : "Erreur BDD inconnue.";
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <header className="rounded-2xl border border-border bg-card px-6 py-7 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Administration
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-foreground">Upload d&apos;images</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          V2 activée : compression automatique, thumbnail et enregistrement des médias en base.
        </p>
        {dbError ? (
          <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            La BDD n&apos;est pas prête: {dbError}. Vérifie `DATABASE_URL` puis applique les migrations Prisma.
          </p>
        ) : null}
        <div className="mt-4">
          <Link href="/admin" className="text-sm font-semibold text-primary hover:underline">
            ← Retour au dashboard admin
          </Link>
        </div>
      </header>

      <AdminImageUploadForm
        initialMedia={media.map((item) => ({
          ...item,
          createdAt: item.createdAt.toISOString(),
        }))}
      />
    </main>
  );
}
