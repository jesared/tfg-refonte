import { prisma } from "@/lib/prisma";
import { CalendarDays, Trophy } from "lucide-react";

import { InscriptionForm } from "./InscriptionForm";

export const dynamic = "force-dynamic";

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

  let tournament: {
    id: string;
    date: Date;
    tour: number;
    salleVille: string;
    categories: { id: string; nom: string; minPoints: number | null; maxPoints: number | null }[];
  } | null = null;

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
        date: true,
        tour: true,
        salleVille: true,
        categories: {
          orderBy: {
            nom: "asc",
          },
          select: {
            id: true,
            nom: true,
            minPoints: true,
            maxPoints: true,
          },
        },
      },
    });
  } catch {
    tournament = null;
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 md:py-12">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          <Trophy className="h-4 w-4" aria-hidden="true" />
          Inscriptions
        </p>

        <h1 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
          Inscription au tournoi{" "}
          {tournament ? <span className="text-primary">· Tour {tournament.tour}</span> : null}
        </h1>

        {tournament ? (
          <>
            <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4 text-primary" aria-hidden="true" />
              Tournoi à venir : <strong className="text-foreground">{tournament.salleVille}</strong> le{" "}
              {formatTournamentDate(tournament.date)}.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Remplissez le formulaire ci-dessous pour vous inscrire. Tous les champs marqués d’un *
              sont obligatoires.
            </p>

            {tournament.categories.length > 0 ? (
              <InscriptionForm tournamentId={tournament.id} categories={tournament.categories} />
            ) : (
              <p className="mt-6 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                Aucune catégorie (tableau) n&apos;est encore configurée.
              </p>
            )}
          </>
        ) : (
          <p className="mt-6 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            Aucun tournoi à venir avec inscriptions ouvertes pour le moment.
          </p>
        )}
      </div>
    </section>
  );
}
