import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminImageUploadForm } from "@/components/admin/AdminImageUploadForm";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export const metadata: Metadata = {
  title: "Admin - Media Library",
  description: "Bibliothèque média de style WordPress pour l'administration.",
};

export default async function AdminUploadsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const media = await prisma.media.findMany({
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

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-10 pt-2 md:px-6">
      <header className="rounded-2xl border border-border bg-card px-6 py-7 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Administration</p>
        <h1 className="mt-3 text-3xl font-semibold text-foreground">Media Library</h1>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground sm:text-base">
          Interface &quot;WP-style&quot; pour uploader, consulter et éditer les assets centralisés du site.
        </p>
        <div className="mt-4">
          <Link href="/admin" className="text-sm font-semibold text-primary hover:underline">
            ← Retour au dashboard admin
          </Link>
        </div>
      </header>

      <AdminImageUploadForm
        initialMedia={media.map((item) => ({
          id: item.id,
          url: item.originalUrl,
          thumbnailUrl: item.thumbnailUrl,
          key: item.objectKey,
          name: item.name ?? "asset",
          type: item.mimeType,
          size: item.sizeBytes,
          alt: item.altText,
          createdAt: item.createdAt.toISOString(),
        }))}
      />
    </main>
  );
}
