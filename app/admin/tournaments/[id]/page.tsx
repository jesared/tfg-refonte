import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { CategoriesManager } from "@/app/admin/tournaments/[id]/_components/CategoriesManager";

export default async function TournamentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
    <main className="mx-auto w-full max-w-4xl p-8 space-y-6">
      <header className="space-y-1">
        <Link href="/admin/tournaments" className="text-sm text-blue-600">
          ← Retour aux tournois
        </Link>
        <h1 className="text-2xl font-bold">{tournament.nom}</h1>
        <p className="text-sm text-gray-500">
          Tour {tournament.tour} · {new Date(tournament.date).toLocaleDateString()} ·{" "}
          {tournament.clubOrganisateur}
        </p>
      </header>

      <section className="rounded border p-4 space-y-1">
        <h2 className="font-semibold">Salle</h2>
        <p>{tournament.salleNom}</p>
        <p className="text-sm text-gray-600">
          {tournament.salleAdresse}, {tournament.salleVille}
        </p>
      </section>

      <section className="rounded border p-4">
        <h2 className="font-semibold mb-2">Statistiques</h2>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>Catégories: {tournament._count.categories}</li>
          <li>Inscriptions: {tournament._count.registrations}</li>
          <li>Inscriptions ouvertes: {tournament.inscriptionOuverte ? "Oui" : "Non"}</li>
        </ul>
      </section>

      <CategoriesManager
        tournamentId={tournament.id}
        tournamentTour={tournament.tour}
        initialCategories={tournament.categories}
      />

      <section className="rounded border p-4">
        <h2 className="font-semibold mb-2">Dernières inscriptions</h2>
        {tournament.registrations.length === 0 ? (
          <p className="text-sm text-gray-500">Aucune inscription pour le moment.</p>
        ) : (
          <ul className="space-y-2">
            {tournament.registrations.map((registration) => (
              <li key={registration.id} className="text-sm border-b pb-2 last:border-0">
                {registration.prenom} {registration.nom} · {registration.numeroLicence} ·{" "}
                {registration.statut}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
