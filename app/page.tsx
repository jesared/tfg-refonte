import { CalendarDays, Home as HomeIcon, MessageSquare, Pencil, Trophy } from "lucide-react";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type CommunitySpotlightItem = Prisma.CommunityPostGetPayload<{
  select: {
    id: true;
    title: true;
    content: true;
    publishedAt: true;
    tournament: {
      select: {
        tour: true;
      };
    };
  };
}>;

const formatDate = (date: Date) =>
  new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export default async function Home() {
  const facebookPageUrl = "https://www.facebook.com/tropheefrancoisgrieder";
  const shareUrl = "https://trophee-francois-grieder.fr";
  const quickLinks = [
    {
      href: "/agenda",
      label: "Agenda",
      description: "Consulter les dates et horaires des prochains événements.",
      icon: CalendarDays,
    },
    {
      href: "/tableaux",
      label: "Tableaux",
      description: "Accéder rapidement aux tournois et catégories en cours.",
      icon: Trophy,
    },
    {
      href: "/inscription",
      label: "Inscriptions",
      description: "S'inscrire en ligne en quelques clics.",
      icon: Pencil,
    },
  ];

  let spotlightPosts: CommunitySpotlightItem[] = [];

  try {
    spotlightPosts = await prisma.communityPost.findMany({
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        title: true,
        content: true,
        publishedAt: true,
        tournament: {
          select: {
            tour: true,
          },
        },
      },
      orderBy: [{ publishedAt: "desc" }],
      take: 3,
    });
  } catch (error) {
    console.error("[home] Unable to load community spotlight", error);
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 sm:gap-10">
      <section className="rounded-3xl border border-border bg-card px-5 py-7 shadow-sm sm:px-8 sm:py-10">
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:text-sm">
          <HomeIcon className="h-5 w-5" aria-hidden="true" />
          <span>Accueil</span>
        </div>

        <div className="mt-4 space-y-4">
          <h1 className="text-2xl font-semibold text-primary sm:text-4xl">
            Bienvenue sur le Trophée François Grieder
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-foreground/90 sm:text-lg">
            Le trophée <span className="font-semibold text-primary">François Grieder</span> est un
            challenge basé sur un classement général des joueuses et joueurs participant aux
            différents tournois régionaux homologués de la Marne, avec une ouverture récente aux
            Ardennes.
          </p>
          <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Cette nouvelle version met l&apos;accent sur la lisibilité et une expérience cohérente
            en mode clair comme en mode sombre, avec une palette Catppuccin harmonisée sur tout le
            site.
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card px-5 py-7 shadow-sm sm:px-8 sm:py-10">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground sm:text-xl">À la une communauté</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Les dernières infos utiles publiées par les clubs et organisateurs du circuit.
          </p>

          {spotlightPosts.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-3">
              {spotlightPosts.map((post) => (
                <a
                  key={post.id}
                  href="/communaute"
                  className="rounded-2xl border border-border bg-background/60 p-4 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm"
                >
                  <p className="text-xs text-muted-foreground">
                    {formatDate(post.publishedAt)}
                    {post.tournament ? ` · Tour ${post.tournament.tour}` : ""}
                  </p>
                  <p className="mt-2 line-clamp-2 font-semibold text-foreground">
                    {post.title ?? "Publication communauté"}
                  </p>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{post.content}</p>
                </a>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              Les publications communautaires apparaîtront ici dès qu&apos;un nouveau contenu sera
              partagé.
            </div>
          )}

          <a
            href="/communaute"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-xs font-semibold text-secondary-foreground shadow-sm transition hover:bg-muted"
          >
            <MessageSquare className="h-4 w-4" aria-hidden="true" />
            Voir toute la communauté
          </a>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card px-5 py-7 shadow-sm sm:px-8 sm:py-10">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground sm:text-xl">Accès rapides</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Retrouvez les pages les plus utiles du site pour naviguer plus facilement.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {quickLinks.map(({ href, label, description, icon: Icon }) => (
              <a
                key={href}
                href={href}
                className="group rounded-2xl border border-border bg-background/60 p-4 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <span className="rounded-xl border border-border bg-card p-2 text-primary">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-semibold text-foreground group-hover:text-primary">{label}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card px-5 py-7 shadow-sm sm:px-8 sm:py-10">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground sm:text-xl">Actualités Facebook</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Retrouvez les dernières publications et annonces via nos canaux officiels, avec un accès
            direct aux actus du site et à la page Facebook.
          </p>
          <ul className="space-y-2 text-sm text-foreground/90">
            <li>• Accédez à la page Facebook officielle en un clic.</li>
            <li>• Partagez facilement le site avec votre entourage.</li>
          </ul>
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href={facebookPageUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#1877F2] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              Suivre sur Facebook
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-xs font-semibold text-secondary-foreground shadow-sm transition hover:bg-muted"
            >
              Partager le site
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
