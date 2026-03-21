import { CommunityPostScope, CommunityZone } from "@prisma/client";
import type { Metadata } from "next";
import Link from "next/link";
import { createHash } from "node:crypto";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import {
  Image as ImageIcon,
  MessageSquare,
  ShieldAlert,
  Sparkles,
  Trophy,
  Gift,
} from "lucide-react";

import { CommunityPostComposer } from "@/components/community-post-composer";
import { CommunityPlayerProfileCard } from "@/components/community-player-profile-card";
import {
  generateActivitySentence,
  hasTripleCrownBadge,
  type ActivityEventPayload,
} from "@/lib/community/activity-feed";
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

const scopeLabel = {
  TOURNAMENT: "Tournois",
  CLUB: "Clubs",
  GENERAL: "Général",
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

type CommunityMemberItem = Prisma.UserGetPayload<{
  select: {
    name: true;
    communityProfile: {
      select: {
        displayName: true;
        club: true;
        roleLabel: true;
        zone: true;
      };
    };
    _count: {
      select: {
        communityPosts: true;
        communityComments: true;
        communityReactions: true;
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

const getAvatarColor = (seed: string) => {
  const colors = [
    "bg-sky-500/15 text-sky-700",
    "bg-fuchsia-500/15 text-fuchsia-700",
    "bg-emerald-500/15 text-emerald-700",
    "bg-amber-500/15 text-amber-700",
    "bg-violet-500/15 text-violet-700",
  ];
  const digest = createHash("sha256").update(seed).digest("hex");
  const value = Number.parseInt(digest.slice(0, 2), 16);
  return colors[value % colors.length];
};

const getFilterClassName = (isActive: boolean) =>
  `rounded-full border px-3 py-1 transition-colors ${
    isActive
      ? "border-primary bg-primary/10 text-primary"
      : "border-border text-foreground hover:bg-muted"
  }`;

const normalizePrefix = (value: string) => value.replace(/\/+$/, "");

const getAllowedImagePrefixes = () => {
  const prefixes = new Set<string>();

  const publicBase = process.env.SUPABASE_PUBLIC_URL_BASE?.trim();
  if (publicBase) {
    try {
      prefixes.add(normalizePrefix(new URL(publicBase).toString()));
    } catch {
      // Ignore malformed env value and fallback to the default Supabase path if available.
    }
  }

  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const bucket = process.env.SUPABASE_STORAGE_BUCKET?.trim();

  if (supabaseUrl && bucket) {
    try {
      const defaultPublicBase = new URL(`/storage/v1/object/public/${bucket}/`, supabaseUrl).toString();
      prefixes.add(normalizePrefix(defaultPublicBase));
    } catch {
      // Ignore malformed env value and keep previously discovered prefixes.
    }
  }

  return [...prefixes];
};

type ComposerSubmissionState = {
  ok: boolean;
  message: string | null;
};

export default async function CommunautePage({
  searchParams,
}: {
  searchParams?: Promise<{ tour?: string; scope?: string; zone?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const params = (await searchParams) ?? {};
  const tourFilter = Number(params.tour);
  const hasTourFilter = Number.isFinite(tourFilter);
  const scopeFilter = String(params.scope ?? "").trim();
  const zoneFilter = String(params.zone ?? "").trim();

  const hasScopeFilter = Object.values(CommunityPostScope).includes(
    scopeFilter as CommunityPostScope,
  );

  const hasZoneFilter = Object.values(CommunityZone).includes(zoneFilter as CommunityZone);
  const allowedImagePrefixes = getAllowedImagePrefixes();

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

  async function submitPostProposal(
    _: ComposerSubmissionState,
    formData: FormData,
  ): Promise<ComposerSubmissionState> {
    "use server";

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { ok: false, message: "Connectez-vous pour publier dans la communauté." };
    }

    const title = String(formData.get("title") ?? "").trim();
    const content = String(formData.get("content") ?? "").trim();
    const tournamentId = String(formData.get("tournamentId") ?? "").trim() || null;
    const zoneValue = String(formData.get("zone") ?? "").trim();
    const scopeValue = String(formData.get("scope") ?? "").trim();
    const rawImageUrl = String(formData.get("imageUrl") ?? "").trim();

    if (content.length < 12) {
      return { ok: false, message: "Le contenu doit contenir au moins 12 caractères." };
    }

    const zone = Object.values(CommunityZone).includes(zoneValue as CommunityZone)
      ? (zoneValue as CommunityZone)
      : null;

    const scope = Object.values(CommunityPostScope).includes(scopeValue as CommunityPostScope)
      ? (scopeValue as CommunityPostScope)
      : CommunityPostScope.TOURNAMENT;

    let imageUrl: string | null = null;
    if (rawImageUrl.length > 0) {
      try {
        const parsedUrl = new URL(rawImageUrl);
        const normalizedUrl = parsedUrl.toString();
        const isHttpUrl = ["http:", "https:"].includes(parsedUrl.protocol);
        const isAllowedHost =
          allowedImagePrefixes.length === 0 ||
          allowedImagePrefixes.some((prefix) => normalizedUrl === prefix || normalizedUrl.startsWith(`${prefix}/`));

        if (isHttpUrl && isAllowedHost) {
          imageUrl = normalizedUrl;
        }
      } catch {
        imageUrl = null;
      }
    }

    try {
      await prisma.communityPost.create({
        data: {
          authorId: session.user.id,
          title: title.length > 0 ? title : null,
          content,
          imageUrl,
          tournamentId,
          zone,
          scope,
          status: "DRAFT",
        },
      });
    } catch (error) {
      console.error("[communaute] Unable to create draft post", error);
      return { ok: false, message: "Impossible d'enregistrer la publication pour le moment." };
    }

    revalidatePath("/communaute");
    revalidatePath("/admin/communaute");
    return { ok: true, message: "Publication envoyée. Elle sera visible après validation admin." };
  }

  try {
    posts = await prisma.communityPost.findMany({
      where: {
        status: "PUBLISHED",
        ...(hasTourFilter ? { tournament: { tour: tourFilter } } : {}),
        ...(hasScopeFilter ? { scope: scopeFilter as CommunityPostScope } : {}),
        ...(hasZoneFilter ? { zone: zoneFilter as CommunityZone } : {}),
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

  const members: CommunityMemberItem[] = await prisma.user.findMany({
    where: {
      communityProfile: {
        is: {
          isVisible: true,
        },
      },
    },
    select: {
      name: true,
      communityProfile: {
        select: {
          displayName: true,
          club: true,
          roleLabel: true,
          zone: true,
        },
      },
      _count: {
        select: {
          communityPosts: true,
          communityComments: true,
          communityReactions: true,
        },
      },
    },
    take: 80,
  });

  const membersByEngagement = members
    .map((member) => ({
      ...member,
      engagementScore:
        member._count.communityPosts * 3 +
        member._count.communityComments * 2 +
        member._count.communityReactions,
    }))
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .slice(0, 6);

  const gradeByEngagement = (engagementScore: number) => {
    if (engagementScore >= 24) {
      return "Élite";
    }

    if (engagementScore >= 14) {
      return "Confirmé";
    }

    return "Challenger";
  };

  const estimatedWinsFromEngagement = (engagementScore: number) =>
    Math.min(5, Math.floor(engagementScore / 8));

  const activityFeedEvents: ActivityEventPayload[] = [
    ...posts.slice(0, 4).map((post) => ({
      playerName:
        post.author.communityProfile?.displayName || post.author.name || "Un joueur du circuit",
      type: "VICTORY" as const,
      tournamentName: post.tournament?.nom,
      createdAt: post.publishedAt,
    })),
    ...membersByEngagement.slice(0, 3).map((member) => ({
      playerName: member.communityProfile?.displayName || member.name || "Un joueur du circuit",
      type: "GRADE_CHANGE" as const,
      previousGrade: "Challenger",
      newGrade: gradeByEngagement(member.engagementScore),
    })),
    ...members.slice(0, 3).map((member) => ({
      playerName: member.communityProfile?.displayName || member.name || "Un joueur du circuit",
      type: "REGISTRATION" as const,
      tournamentName: tournaments[0]?.nom,
    })),
  ].slice(0, 8);

  const uniqueClubs = new Set(
    members
      .map((member) => member.communityProfile?.club)
      .filter((club): club is string => Boolean(club && club.trim())),
  );

  const totalInteractions = posts.reduce(
    (acc, post) => acc + post._count.comments + post._count.reactions,
    0,
  );
  const postsWithMedia = posts.filter((post) => Boolean(post.imageUrl)).length;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 sm:gap-8">
      <section className="rounded-3xl border border-border bg-card px-5 py-7 shadow-sm sm:px-8 sm:py-10">
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:text-sm">
          <MessageSquare className="h-5 w-5" aria-hidden="true" />
          <span>Communauté</span>
        </div>
        <div className="mt-4 space-y-4">
          <h1 className="text-2xl font-semibold text-primary sm:text-4xl">
            Dashboard Social du circuit TFG
          </h1>
          <p className="max-w-4xl text-base leading-relaxed text-foreground/90 sm:text-lg">
            Pilotez les membres du Trophée, suivez les interactions et visualisez les publications
            clés sur un espace unique dédié à la vie de la communauté.
            {hasTourFilter ? ` Filtré sur le tour ${tourFilter}.` : ""}
            {hasScopeFilter ? ` Type: ${scopeLabel[scopeFilter as CommunityPostScope]}.` : ""}
            {hasZoneFilter ? ` Zone: ${zoneLabel[zoneFilter as CommunityZone]}.` : ""}
          </p>
        </div>

        {session?.user ? (
          <div className="mt-6 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4 sm:p-5">
            <CommunityPostComposer action={submitPostProposal} tournaments={tournaments} />
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-2xl border border-border bg-muted/40 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Publications</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{posts.length}</p>
        </article>
        <article className="rounded-2xl border border-border bg-muted/40 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Interactions</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{totalInteractions}</p>
        </article>
        <article className="rounded-2xl border border-border bg-muted/40 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Membres visibles</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{members.length}</p>
        </article>
        <article className="rounded-2xl border border-border bg-muted/40 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Clubs actifs</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{uniqueClubs.size}</p>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <article className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Filtres rapides du fil
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <a href="/communaute" className={getFilterClassName(!hasScopeFilter && !hasZoneFilter)}>
              Tous
            </a>
            <a
              href="/communaute?scope=TOURNAMENT"
              className={getFilterClassName(scopeFilter === CommunityPostScope.TOURNAMENT)}
            >
              Tournois
            </a>
            <a
              href="/communaute?scope=CLUB"
              className={getFilterClassName(scopeFilter === CommunityPostScope.CLUB)}
            >
              Clubs
            </a>
            <a
              href="/communaute?scope=GENERAL"
              className={getFilterClassName(scopeFilter === CommunityPostScope.GENERAL)}
            >
              Général
            </a>
            <a
              href="/communaute?zone=MARNE"
              className={getFilterClassName(zoneFilter === CommunityZone.MARNE)}
            >
              Zone Marne
            </a>
            <a
              href="/communaute?zone=ARDENNES"
              className={getFilterClassName(zoneFilter === CommunityZone.ARDENNES)}
            >
              Zone Ardennes
            </a>
          </div>
        </article>

        <article className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Vue globale
          </p>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Publications média</span>
              <span className="font-semibold text-foreground">{postsWithMedia}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Signalements ouverts</span>
              <span className="font-semibold text-foreground">
                {posts.reduce((acc, post) => acc + post._count.reports, 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Tours visibles</span>
              <span className="font-semibold text-foreground">
                {new Set(posts.map((post) => post.tournament?.tour).filter(Boolean)).size}
              </span>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <article className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Profils joueurs
              </p>
              <h2 className="mt-1 text-lg font-semibold text-foreground">
                Micro-réseau social sportif
              </h2>
            </div>
            <Trophy className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {membersByEngagement.map((member) => {
              const playerName =
                member.communityProfile?.displayName || member.name || "Membre de la communauté";
              const wins = estimatedWinsFromEngagement(member.engagementScore);
              return (
                <CommunityPlayerProfileCard
                  key={`${playerName}-profile`}
                  playerName={playerName}
                  grade={gradeByEngagement(member.engagementScore)}
                  club={member.communityProfile?.club}
                  zone={
                    member.communityProfile?.zone ? zoneLabel[member.communityProfile.zone] : null
                  }
                  wins={wins}
                  hasTripleCrown={hasTripleCrownBadge(wins)}
                />
              );
            })}
          </div>
        </article>

        <article className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Fil d’activité
              </p>
              <h2 className="mt-1 text-lg font-semibold text-foreground">Événements récents</h2>
            </div>
            <Sparkles className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          </div>
          <div className="mt-4 space-y-2">
            {activityFeedEvents.map((event, index) => (
              <p
                key={`${event.playerName}-${event.type}-${index}`}
                className="rounded-lg bg-muted/40 p-2.5 text-xs text-foreground/90"
              >
                {generateActivitySentence(event)}
              </p>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Membres les plus engagés
            </p>
            <h2 className="mt-1 text-lg font-semibold text-foreground">Participants à suivre</h2>
          </div>
          <Gift className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {membersByEngagement.map((member) => {
            const name =
              member.communityProfile?.displayName || member.name || "Membre de la communauté";
            const initial = name.charAt(0).toUpperCase();

            return (
              <article key={name} className="rounded-xl border border-border bg-muted/30 p-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${getAvatarColor(
                      name,
                    )}`}
                  >
                    {initial}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{name}</p>
                    <p className="text-xs text-muted-foreground">
                      {member.communityProfile?.roleLabel ?? "Participant"}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
                  {member.communityProfile?.club ? (
                    <span className="rounded-full bg-background px-2 py-0.5 text-muted-foreground">
                      {member.communityProfile.club}
                    </span>
                  ) : null}
                  {member.communityProfile?.zone ? (
                    <span className="rounded-full bg-background px-2 py-0.5 text-muted-foreground">
                      {zoneLabel[member.communityProfile.zone]}
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  Score engagement: {member.engagementScore}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        {posts.map((post) => {
          const authorName =
            post.author.communityProfile?.displayName ||
            post.author.name ||
            "Membre de la communauté";
          const authorInitial = authorName.trim().charAt(0).toUpperCase() || "M";
          const avatarColor = getAvatarColor(authorName);

          return (
            <article
              key={post.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${avatarColor}`}
                  >
                    {authorInitial}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{authorName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(post.publishedAt)}
                      {post.author.communityProfile?.club
                        ? ` · ${post.author.communityProfile.club}`
                        : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {scopeLabel[post.scope]}
                  </span>
                  {post.zone ? (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground/80">
                      {zoneLabel[post.zone]}
                    </span>
                  ) : null}
                </div>
              </div>

              <h2 className="mt-3 line-clamp-2 text-lg font-semibold text-foreground">
                {post.title ?? "Publication communauté"}
              </h2>

              <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-foreground/90">
                {post.content}
              </p>

              {post.imageUrl ? (
                <Link
                  href={post.imageUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-4 block overflow-hidden rounded-xl border border-border bg-muted/20"
                >
                  <img
                    src={post.imageUrl}
                    alt={`Image de la publication ${post.title ?? "communauté"}`}
                    className="aspect-video w-full object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                </Link>
              ) : null}

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
                {post.imageUrl ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-emerald-700">
                    <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    Image jointe
                  </span>
                ) : null}
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
