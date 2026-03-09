import { prisma } from "@/lib/prisma";

import { InscriptionForm } from "./InscriptionForm";

function formatTournamentDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function InscriptionPage() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  let tournament: { id: string; nom: string; tour: number; date: Date } | null = null;
  let categories: { id: string; nom: string }[] = [];

  try {
    tournament = await prisma.tournament.findFirst({
      where: {
        inscriptionOuverte: true,
        date: {
          gte: now,
        },
      },
      orderBy: {
        date: "asc",
      },
      select: {
        id: true,
        nom: true,
        tour: true,
        date: true,
      },
    });

    categories = await prisma.category.findMany({
      orderBy: {
        nom: "asc",
      },
      select: {
        id: true,
        nom: true,
      },
    });
  } catch {
    tournament = null;
    categories = [];
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 md:py-12">
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Inscription au tournoi {tournament ? <span className="text-blue-600">· Tour {tournament.tour}</span> : null}
        </h1>

        {tournament ? (
          <>
            <p className="mt-2 text-sm text-muted-foreground">
              Tournoi à venir : <strong>{tournament.nom}</strong> le {formatTournamentDate(tournament.date)}.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Remplissez le formulaire ci-dessous pour vous inscrire. Tous les champs marqués d’un * sont
              obligatoires.
            </p>

            {categories.length > 0 ? (
              <InscriptionForm tournamentId={tournament.id} categories={categories} />
            ) : (
              <p className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                Aucune catégorie (tableau) n&apos;est encore configurée.
              </p>
            )}
          </>
        ) : (
          <p className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
            Aucun tournoi à venir avec inscriptions ouvertes pour le moment.
          </p>
        )}
      </div>
    </section>
  );
}
