import type { FacebookPost } from "@prisma/client";
import type { Metadata } from "next";
import Link from "next/link";

import { FacebookPostCard } from "@/components/FacebookPostCard";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Actualités du Trophée François Grieder",
  description:
    "Retrouvez les dernières actualités du Trophée François Grieder via Facebook et les pages officielles du site.",
};

type AlternativeNewsItem = {
  title: string;
  description: string;
  href: string;
  linkLabel: string;
};

const alternativeNewsItems: AlternativeNewsItem[] = [
  {
    title: "Infos tournoi",
    description: "Consultez les prochaines étapes et les informations pratiques du Trophée.",
    href: "/trophee",
    linkLabel: "Voir la page Trophée",
  },
  {
    title: "Tableaux & résultats",
    description: "Suivez les tableaux en cours et les résultats mis à jour sur le site.",
    href: "/tableaux",
    linkLabel: "Accéder aux tableaux",
  },
  {
    title: "Classements",
    description: "Retrouvez les classements officiels sans attendre une publication Facebook.",
    href: "/classements",
    linkLabel: "Voir les classements",
  },
  {
    title: "Contact organisateurs",
    description: "Besoin d'une info urgente ? Contactez directement l'équipe du Trophée.",
    href: "/contact",
    linkLabel: "Aller à la page contact",
  },
];

async function getLatestPosts(): Promise<FacebookPost[]> {
  try {
    return await prisma.facebookPost.findMany({
      where: {
        type: {
          not: null,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 12,
    });
  } catch (error) {
    console.error("Impossible de récupérer les actualités Facebook", error);
    return [];
  }
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
              Les publications Facebook apparaîtront ici dès leur synchronisation. En attendant,
              utilisez les autres canaux ci-dessous pour suivre les informations du Trophée.
            </p>
          </section>
        )}

        {posts.length === 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Autres moyens de suivre l&apos;actualité</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {alternativeNewsItems.map((item) => (
                <article
                  key={item.title}
                  className="rounded-2xl border border-border bg-background p-6 shadow-sm"
                >
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                  <Link
                    href={item.href}
                    className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline"
                  >
                    {item.linkLabel}
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}

        <div className="flex justify-center">
          <a
            href={facebookPageUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Voir la page Facebook officielle
          </a>
        </div>
      </div>
    </main>
  );
}
