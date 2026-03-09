import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export default async function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const { id } = await params;

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      categories: {
        orderBy: { nom: "asc" },
      },
      registrations: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      _count: {
        select: { registrations: true, categories: true },
      },
    },
  });

  if (!tournament) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 p-6 md:p-8 text-foreground">
      <header className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <Link href="/admin/tournaments" className="inline-flex items-center rounded-md border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted">
              Retour à tous les tournois
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">{tournament.nom}</h1>
            <p className="text-sm text-muted-foreground">
              Tour {tournament.tour} · {new Date(tournament.date).toLocaleDateString("fr-FR")} · {" "}
              {tournament.clubOrganisateur}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/admin/tournaments/${tournament.id}/edit`}
              className="inline-flex items-center rounded-md border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Modifier le tournoi
            </Link>
            <Link
              href={`/admin/categories/new?tournamentId=${tournament.id}`}
              className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              + Nouvelle catégorie
            </Link>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Salle</h2>
          <p className="font-medium">{tournament.salleNom}</p>
          <p className="text-sm text-muted-foreground">
            {tournament.salleAdresse}, {tournament.salleVille}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Statistiques</h2>
          <ul className="space-y-1 text-sm">
            <li>Catégories: {tournament._count.categories}</li>
            <li>Inscriptions: {tournament._count.registrations}</li>
            <li>Inscriptions ouvertes: {tournament.inscriptionOuverte ? "Oui" : "Non"}</li>
          </ul>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">Catégories</h2>

        {tournament.categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune catégorie pour le moment.</p>
        ) : (
          <ul className="space-y-2">
            {tournament.categories.map((category) => (
              <li key={category.id} className="rounded-lg border border-border bg-background p-3 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{category.nom}</p>
                    <p className="text-xs text-muted-foreground">
                      Horaire: {new Date(category.heureDebut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      {category.heureFin
                        ? ` - ${new Date(category.heureFin).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                        : ""}{" "}
                      · Points: {category.minPoints ?? "-∞"} → {category.maxPoints ?? "+∞"} · Max joueurs:{" "}
                      {category.maxJoueurs ?? "Non limité"}
                    </p>
                  </div>
                  <Link
                    href={`/admin/categories/${category.id}/edit?scope=round`}
                    className="inline-flex items-center rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                  >
                    Modifier
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">Dernières inscriptions</h2>
        {tournament.registrations.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune inscription pour le moment.</p>
        ) : (
          <ul className="space-y-2">
            {tournament.registrations.map((registration) => (
              <li key={registration.id} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
                {registration.prenom} {registration.nom} · {registration.numeroLicence} · {registration.statut}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
