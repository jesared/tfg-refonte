import { CalendarDays, Check, ShieldCheck, Trophy } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CategoryActions } from "@/app/admin/categories/_components/CategoryActions";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

function formatTime(date: Date | null) {
  if (!date) {
    return null;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function AdminCategoriesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const tournaments = await prisma.tournament.findMany({
    orderBy: [{ date: "asc" }, { tour: "asc" }],
    select: {
      id: true,
      nom: true,
      tour: true,
      date: true,
      salleVille: true,
      categories: {
        orderBy: [{ nom: "asc" }],
        select: {
          id: true,
          nom: true,
          heureDebut: true,
          heureFin: true,
          minPoints: true,
          maxPoints: true,
          _count: {
            select: {
              engagements: true,
            },
          },
        },
      },
      _count: {
        select: {
          registrations: true,
        },
      },
    },
  });

  const totalCategories = tournaments.reduce(
    (sum, tournament) => sum + tournament.categories.length,
    0,
  );
  const totalRegistrations = tournaments.reduce(
    (sum, tournament) => sum + tournament._count.registrations,
    0,
  );

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <header className="rounded-2xl border border-border bg-card px-6 py-7 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Admin
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-foreground">Catégories</h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Les catégories sont séparées par tour pour garder une gestion claire, tout en
              conservant les mêmes paramètres quand vous les dupliquez.
            </p>
          </div>

          <Link
            href="/admin/categories/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            <Check className="h-4 w-4" aria-hidden="true" />
            Nouvelle catégorie
          </Link>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2 text-primary">
            <Trophy className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="text-sm text-muted-foreground">Tours disponibles</p>
          <p className="mt-1 text-3xl font-semibold text-foreground">{tournaments.length}</p>
        </article>

        <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2 text-primary">
            <CalendarDays className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="text-sm text-muted-foreground">Catégories au total</p>
          <p className="mt-1 text-3xl font-semibold text-foreground">{totalCategories}</p>
        </article>

        <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2 text-primary">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="text-sm text-muted-foreground">Inscriptions enregistrées</p>
          <p className="mt-1 text-3xl font-semibold text-foreground">{totalRegistrations}</p>
        </article>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Catégories par tour
          </h2>
          <p className="text-xs text-muted-foreground">
            Affichage compact, ouvrable uniquement si besoin
          </p>
        </div>

        {tournaments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
            <p className="text-sm text-muted-foreground">Aucun tournoi n&apos;a encore été créé.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tournaments.map((tournament) => (
              <details
                key={tournament.id}
                className="rounded-xl border border-border/80 bg-muted/20 p-4"
              >
                <summary className="cursor-pointer list-none">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-foreground">
                      Tour {tournament.tour} · {tournament.nom}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {tournament.categories.length} catégorie
                      {tournament.categories.length > 1 ? "s" : ""} ·{" "}
                      {tournament._count.registrations} inscrit
                      {tournament._count.registrations > 1 ? "s" : ""}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDate(tournament.date)} · {tournament.salleVille}
                  </p>
                </summary>

                <div className="mt-4 space-y-2 border-t border-border/70 pt-4">
                  {tournament.categories.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucune catégorie sur ce tour.</p>
                  ) : (
                    tournament.categories.map((category) => {
                      const start = formatTime(category.heureDebut);
                      const end = formatTime(category.heureFin);

                      return (
                        <article
                          key={category.id}
                          className="rounded-lg border border-border bg-background p-3"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="font-medium text-foreground">{category.nom}</p>
                              <p className="text-xs text-muted-foreground">
                                {start ?? "Horaire non défini"}
                                {end ? ` - ${end}` : ""} · {category.minPoints ?? "-∞"} →{" "}
                                {category.maxPoints ?? "+∞"} points
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {category._count.engagements} engagement
                                {category._count.engagements > 1 ? "s" : ""}
                              </p>
                            </div>

                            <CategoryActions categoryId={category.id} categoryName={category.nom} />
                          </div>
                        </article>
                      );
                    })
                  )}

                  <div className="pt-1">
                    <Link
                      href={`/admin/tournaments/${tournament.id}`}
                      className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Voir les inscrits de ce tour
                    </Link>
                  </div>
                </div>
              </details>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
