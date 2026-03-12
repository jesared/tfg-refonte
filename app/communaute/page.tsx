import { CommunityPostScope, CommunityZone } from "@prisma/client";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { MessageSquare, ShieldAlert, Sparkles, Trophy } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

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

export default async function CommunautePage({
  searchParams,
}: {
  searchParams?: Promise<{ tour?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const params = (await searchParams) ?? {};
  const tourFilter = Number(params.tour);
  const hasTourFilter = Number.isFinite(tourFilter);

  let posts: CommunityPostFeedItem[] = [];
  const tournaments = await prisma.tournament.findMany({
    orderBy: [{ date: "desc" }],
    take: 12,
    select: {
      id: true,
      nom: true,
      tour: true,
      date: true,
    },
  });

  async function submitPostProposal(formData: FormData) {
    "use server";

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return;
    }

    const title = String(formData.get("title") ?? "").trim();
    const content = String(formData.get("content") ?? "").trim();
    const tournamentId = String(formData.get("tournamentId") ?? "").trim() || null;
    const zoneValue = String(formData.get("zone") ?? "").trim();
    const scopeValue = String(formData.get("scope") ?? "").trim();

    if (content.length < 12) {
      return;
    }

    const zone = Object.values(CommunityZone).includes(zoneValue as CommunityZone)
      ? (zoneValue as CommunityZone)
      : null;

    const scope = Object.values(CommunityPostScope).includes(scopeValue as CommunityPostScope)
      ? (scopeValue as CommunityPostScope)
      : CommunityPostScope.TOURNAMENT;

    await prisma.communityPost.create({
      data: {
        authorId: session.user.id,
        title: title.length > 0 ? title : null,
        content,
        tournamentId,
        zone,
        scope,
        status: "DRAFT",
      },
    });

    revalidatePath("/communaute");
    revalidatePath("/admin/communaute");
  }

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
    console.error("[communaute] Unable to load community posts", error);
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

        {session?.user ? (
          <div className="mt-6 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4 sm:p-5">
            <h2 className="text-base font-semibold text-foreground sm:text-lg">
              Proposer une publication
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Votre message est enregistré en brouillon puis validé par un administrateur avant
              publication.
            </p>

            <form action={submitPostProposal} className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 sm:col-span-2">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Titre (optionnel)
                </span>
                <input
                  type="text"
                  name="title"
                  maxLength={140}
                  placeholder="Ex: Résultats du tour 2 à Reims"
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                />
              </label>

              <label className="flex flex-col gap-1 sm:col-span-2">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Contenu
                </span>
                <textarea
                  name="content"
                  required
                  minLength={12}
                  maxLength={2000}
                  rows={5}
                  placeholder="Partagez une annonce, un résultat ou une info utile à la communauté."
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Type
                </span>
                <select
                  name="scope"
                  defaultValue={CommunityPostScope.TOURNAMENT}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value={CommunityPostScope.TOURNAMENT}>Tournoi</option>
                  <option value={CommunityPostScope.CLUB}>Club</option>
                  <option value={CommunityPostScope.GENERAL}>Général</option>
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Zone
                </span>
                <select
                  name="zone"
                  defaultValue=""
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Non précisée</option>
                  <option value={CommunityZone.MARNE}>Marne</option>
                  <option value={CommunityZone.ARDENNES}>Ardennes</option>
                  <option value={CommunityZone.BOTH}>Marne + Ardennes</option>
                </select>
              </label>

              <label className="flex flex-col gap-1 sm:col-span-2">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Tournoi lié (optionnel)
                </span>
                <select
                  name="tournamentId"
                  defaultValue=""
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Aucun tournoi spécifique</option>
                  {tournaments.map((tournament) => (
                    <option key={tournament.id} value={tournament.id}>
                      Tour {tournament.tour} · {tournament.nom}
                    </option>
                  ))}
                </select>
              </label>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                >
                  Envoyer pour validation
                </button>
              </div>
            </form>
          </div>
        ) : null}
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
            post.author.communityProfile?.displayName ||
            post.author.name ||
            "Membre de la communauté";

          return (
            <article
              key={post.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
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
                {post.author.communityProfile?.club
                  ? ` · ${post.author.communityProfile.club}`
                  : ""}
              </p>

              <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-foreground/90">
                {post.content}
              </p>

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
          <h2 className="mt-3 text-lg font-semibold text-foreground">
            Aucune publication pour le moment
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Les annonces clubs et résultats des prochains tours seront visibles ici.
          </p>
        </section>
      ) : null}
    </main>
  );
}
