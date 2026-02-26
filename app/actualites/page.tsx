import type { FacebookPost } from "@prisma/client";
import type { Metadata } from "next";

import { FacebookPostCard } from "@/components/FacebookPostCard";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Actualités du Trophée François Grieder",
  description:
    "Retrouvez les dernières actualités Facebook du Trophée François Grieder, publiées en temps réel.",
};

async function getLatestPosts(): Promise<FacebookPost[]> {
  return prisma.facebookPost.findMany({
    where: {
      type: {
        not: null, // 🔥 On exclut définitivement les type null
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 12,
  });
}

export default async function ActualitesPage() {
  const posts = await getLatestPosts();

  const facebookPageUrl = "https://www.facebook.com/tropheefrancoisgrieder";

  return (
    <main className="min-h-screen bg-card px-6 py-16 text-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <header className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Actualités
          </p>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
            Actualités du Trophée François Grieder
          </h1>
          <p className="max-w-3xl text-base text-muted-foreground sm:text-lg">
            Suivez les dernières publications officielles et les moments marquants du trophée.
          </p>
        </header>

        {posts.length > 0 ? (
          <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <FacebookPostCard key={post.id} post={post} />
            ))}
          </section>
        ) : (
          <section className="rounded-3xl border border-border bg-muted/40 p-8 text-center shadow-sm">
            <h2 className="text-xl font-semibold">Aucune actualité disponible pour le moment</h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Les publications Facebook apparaîtront ici dès leur synchronisation.
            </p>
          </section>
        )}

        <div className="flex justify-center">
          <a
            href={facebookPageUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Voir plus de publications sur Facebook
          </a>
        </div>
      </div>
    </main>
  );
}
