import { CalendarDays, Check, ShieldCheck, Trophy } from "lucide-react";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { TournamentActionMenu } from "./_components/tournament-action-menu";
import { TournamentFilters } from "./_components/tournament-filters";

type PageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
    tour?: string;
    from?: string;
    to?: string;
  }>;
};

export default async function TournamentsPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const params = (await searchParams) ?? {};
  const q = params.q?.trim() ?? "";
  const status = params.status ?? "all";
  const tour = Number.parseInt(params.tour ?? "", 10);

  const startDate = params.from ? new Date(`${params.from}T00:00:00.000Z`) : null;
  const endDate = params.to ? new Date(`${params.to}T23:59:59.999Z`) : null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const where: Prisma.TournamentWhereInput = {};

  if (q) {
    where.nom = { contains: q, mode: "insensitive" };
  }

  if (!Number.isNaN(tour)) {
    where.tour = tour;
  }

  if (startDate || endDate) {
    where.date = {
      ...(startDate ? { gte: startDate } : {}),
      ...(endDate ? { lte: endDate } : {}),
    };
  }

  if (status === "open") {
    where.inscriptionOuverte = true;
  }

  if (status === "closed") {
    where.inscriptionOuverte = false;
  }

  if (status === "past") {
    where.date = {
      ...(where.date ?? {}),
      lt: today,
    };
  }

  if (status === "upcoming") {
    where.date = {
      ...(where.date ?? {}),
      gte: today,
    };
  }

  const tournaments = await prisma.tournament.findMany({
    where,
    orderBy: [{ date: "desc" }],
  });

  const openRegistrationsCount = tournaments.filter((tournament) => tournament.inscriptionOuverte).length;
  const pastTournamentsCount = tournaments.filter((tournament) => new Date(tournament.date) < today).length;

  async function deleteTournament(formData: FormData) {
    "use server";

    const actionSession = await getServerSession(authOptions);

    if (!actionSession?.user || actionSession.user.role !== "ADMIN") {
      redirect("/");
    }

    const tournamentId = String(formData.get("tournamentId") ?? "");

    if (!tournamentId) {
      return;
    }

    await prisma.$transaction([
      prisma.engagement.deleteMany({ where: { registration: { tournamentId } } }),
      prisma.registration.deleteMany({ where: { tournamentId } }),
      prisma.category.deleteMany({ where: { tournamentId } }),
      prisma.tournament.delete({ where: { id: tournamentId } }),
    ]);

    revalidatePath("/admin/tournaments");
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <header className="rounded-2xl border border-border bg-card px-6 py-7 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Admin</p>
            <h1 className="mt-3 text-3xl font-semibold text-foreground">Tournois</h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Centralisez les étapes du TFG, suivez les inscriptions ouvertes et accédez rapidement
              à la gestion détaillée de chaque tournoi.
            </p>
          </div>

          <Link
            href="/admin/tournaments/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            <Check className="h-4 w-4" aria-hidden="true" />
            Nouveau tournoi
          </Link>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2 text-primary">
            <Trophy className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="text-sm text-muted-foreground">Tournois enregistrés</p>
          <p className="mt-1 text-3xl font-semibold text-foreground">{tournaments.length}</p>
        </article>

        <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2 text-primary">
            <CalendarDays className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="text-sm text-muted-foreground">Tournois passés</p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {pastTournamentsCount}
          </p>
        </article>

        <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2 text-primary">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="text-sm text-muted-foreground">Inscriptions ouvertes</p>
          <p className="mt-1 text-3xl font-semibold text-foreground">{openRegistrationsCount}</p>
        </article>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Liste des tournois
          </h2>
          <p className="text-xs text-muted-foreground">Triés du plus récent au plus ancien</p>
        </div>

        <TournamentFilters />

        {tournaments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
            <p className="text-sm text-muted-foreground">Aucun tournoi n&apos;a encore été créé.</p>
            <Link
              href="/admin/tournaments/new"
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              Créer le premier tournoi
            </Link>
          </div>
        ) : (
          <div>
            <table className="w-full table-fixed text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-3 py-2">Nom</th>
                  <th className="px-3 py-2">Tour</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Statut</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
              {tournaments.map((tournament) => {
                const isPastTournament = new Date(tournament.date) < today;

                return (
                  <tr key={tournament.id} className="border-b border-border/60 last:border-0">
                    <td className="px-3 py-3 font-medium text-foreground">{tournament.nom}</td>
                    <td className="px-3 py-3">Tour {tournament.tour}</td>
                    <td className="px-3 py-3">{new Date(tournament.date).toLocaleDateString("fr-FR")}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {isPastTournament ? (
                          <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                            Tournoi passé
                          </span>
                        ) : null}

                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                            tournament.inscriptionOuverte
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {tournament.inscriptionOuverte
                            ? "Inscriptions ouvertes"
                            : "Inscriptions fermées"}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end">
                        <TournamentActionMenu
                          tournamentId={tournament.id}
                          tournamentName={tournament.nom}
                          deleteTournament={deleteTournament}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
