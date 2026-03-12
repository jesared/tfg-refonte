import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { MessageSquare, ShieldAlert, Sparkles, Trophy } from "lucide-react";

import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Communauté",
  description:
    "Fil communautaire du Trophée François Grieder pour suivre les annonces clubs, résultats et vie des tours.",
};

const zoneLabel = {
  MARNE: "Marne",
  ARDENNES: "Ardennes",
  BOTH: "Marne + Ardennes",
} as const;

type CommunityPostFeedItem = Prisma.CommunityPostGetPayload<{
  include: {
    author: {
      select: {
        name: true;
        communityProfile: {
          select: {
            displayName: true;
            club: true;
          };
        };
      };
    };
    tournament: {
      select: {
        nom: true;
        tour: true;
        date: true;
      };
    };
    _count: {
      select: {
        comments: true;
        reactions: true;
        reports: true;
      };
    };
  };
}>;

const formatDate = (date: Date) =>
  new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

export default async function ActualitesPage({
  searchParams,
}: {
  searchParams?: Promise<{ tour?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const tourFilter = Number(params.tour);
  const hasTourFilter = Number.isFinite(tourFilter);

  let posts: CommunityPostFeedItem[] = [];

  try {
    posts = await prisma.communityPost.findMany({
      where: {
        status: "PUBLISHED",
        ...(hasTourFilter ? { tournament: { tour: tourFilter } } : {}),
      },
      include: {
        author: {
          select: {
            name: true,
            communityProfile: {
              select: {
                displayName: true,
                club: true,
              },
            },
          },
        },
        tournament: {
          select: {
            nom: true,
            tour: true,
            date: true,
          },
        },
        _count: {
          select: {
            comments: true,
            reactions: true,
            reports: true,
          },
        },
      },
      orderBy: [{ publishedAt: "desc" }],
      take: 24,
    });
  } catch (error) {
    console.error("[actualites] Unable to load community posts", error);
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 sm:gap-8">
      <section className="rounded-3xl border border-border bg-card px-5 py-7 shadow-sm sm:px-8 sm:py-10">
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:text-sm">
          <MessageSquare className="h-5 w-5" aria-hidden="true" />
          <span>Communauté</span>
        </div>
        <div className="mt-4 space-y-4">
          <h1 className="text-2xl font-semibold text-primary sm:text-4xl">
            Les publications du circuit TFG
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-foreground/90 sm:text-lg">
            Retrouvez les annonces des clubs, les résultats marquants et la vie des tours autour du
            Trophée François Grieder.
            {hasTourFilter ? ` Filtré sur le tour ${tourFilter}.` : ""}
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-border bg-muted/40 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Publications</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{posts.length}</p>
        </article>
        <article className="rounded-2xl border border-border bg-muted/40 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Interactions</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {posts.reduce((acc, post) => acc + post._count.comments + post._count.reactions, 0)}
          </p>
        </article>
        <article className="rounded-2xl border border-border bg-muted/40 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Signalements</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {posts.reduce((acc, post) => acc + post._count.reports, 0)}
          </p>
        </article>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => {
          const authorName =
            post.author.communityProfile?.displayName || post.author.name || "Membre de la communauté";

          return (
            <article key={post.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>{formatDate(post.publishedAt)}</span>
                {post.zone ? (
                  <span className="rounded-full bg-muted px-2 py-0.5 font-medium text-foreground/80">
                    {zoneLabel[post.zone]}
                  </span>
                ) : null}
              </div>

              <h2 className="mt-3 line-clamp-2 text-lg font-semibold text-foreground">
                {post.title ?? "Publication communauté"}
              </h2>

              <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
                Par {authorName}
                {post.author.communityProfile?.club ? ` · ${post.author.communityProfile.club}` : ""}
              </p>

              <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-foreground/90">{post.content}</p>

              {post.tournament ? (
                <div className="mt-4 rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground">Tour {post.tournament.tour}</p>
                  <p>
                    {post.tournament.nom} · {formatDate(post.tournament.date)}
                  </p>
                </div>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-primary">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  {post._count.reactions} réactions
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-secondary-foreground">
                  <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                  {post._count.comments} commentaires
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
                  <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
                  {post._count.reports} signalements
                </span>
              </div>
            </article>
          );
        })}
      </section>

      {posts.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center">
          <Trophy className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <h2 className="mt-3 text-lg font-semibold text-foreground">Aucune publication pour le moment</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Les annonces clubs et résultats des prochains tours seront visibles ici.
          </p>
        </section>
      ) : null}
    </main>
  );
}
