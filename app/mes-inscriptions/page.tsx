import { CalendarDays, Check, Trophy } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

const statusLabels = {
  EN_ATTENTE: "En attente",
  VALIDE: "Validée",
  REFUSE: "Refusée",
  ANNULE: "Annulée",
} as const;

export default async function MesInscriptionsPage({
  searchParams,
}: {
  searchParams?: Promise<{ created?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return (
      <section className="mx-auto w-full max-w-3xl rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-foreground">À vos inscriptions</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Connectez-vous pour consulter vos engagements aux différents tours.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Retour à l&apos;accueil
        </Link>
      </section>
    );
  }

  const params = await searchParams;
  const showCreatedMessage = params?.created === "1";

  const registrations = await prisma.registration.findMany({
    where: { userId: session.user.id },
    orderBy: [{ tournament: { date: "asc" } }, { createdAt: "asc" }],
    select: {
      id: true,
      statut: true,
      tournament: {
        select: {
          nom: true,
          tour: true,
          date: true,
          salleVille: true,
        },
      },
      category: {
        select: {
          nom: true,
        },
      },
    },
  });

  return (
    <section className="mx-auto w-full max-w-4xl space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div>
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          <Trophy className="h-4 w-4" aria-hidden="true" />
          Mon espace
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">À vos inscriptions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Retrouvez toutes vos inscriptions enregistrées sur les tours du TFG.
        </p>
      </div>

      {showCreatedMessage && (
        <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
          Votre inscription a bien été enregistrée.
        </p>
      )}

      {registrations.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-4 text-sm text-muted-foreground">
          Vous n&apos;avez encore aucune inscription.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Tournoi</th>
                <th className="px-4 py-3 font-medium">Date & lieu</th>
                <th className="px-4 py-3 font-medium">Tableau</th>
                <th className="px-4 py-3 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((registration) => (
                <tr key={registration.id} className="border-t border-border/70">
                  <td className="px-4 py-3 font-medium text-foreground">
                    Tour {registration.tournament.tour} · {registration.tournament.nom}
                  </td>
                  <td className="px-4 py-3 text-foreground/90">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                      {formatDate(registration.tournament.date)} · {registration.tournament.salleVille}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground/90">{registration.category.nom}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-foreground/90">
                      <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                      {statusLabels[registration.statut]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
