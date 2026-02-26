import { CalendarDays, Check, ChevronRight, ShieldCheck, Table2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/pages/api/auth/[...nextauth]";

export const metadata: Metadata = {
  title: "Admin - Tournois",
  description: "Validation et suivi des tournois importés.",
};

const pendingImports = [
  {
    name: "Open d'hiver - Mulhouse",
    receivedAt: "12/01/2026",
    status: "À valider",
    players: 38,
  },
  {
    name: "Critérium jeunes - Colmar",
    receivedAt: "10/01/2026",
    status: "Incomplet",
    players: 22,
  },
  {
    name: "Tournoi régional - Strasbourg",
    receivedAt: "09/01/2026",
    status: "Prêt à publier",
    players: 54,
  },
];

const checks = [
  "Vérifier la cohérence des catégories et des points attribués.",
  "Contrôler les doubles inscriptions avant fusion des résultats.",
  "Exporter les anomalies pour correction par les clubs organisateurs.",
];

export default async function AdminTournoisPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <header className="rounded-2xl border border-border bg-card px-6 py-7 shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          Suivi des imports
        </div>
        <h1 className="mt-4 text-3xl font-semibold text-foreground">Validation des tournois</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Vue de contrôle pour traiter rapidement les résultats reçus et sécuriser leur publication.
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
          Imports en attente
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="px-3 py-2 font-medium">Tournoi</th>
                <th className="px-3 py-2 font-medium">Reçu le</th>
                <th className="px-3 py-2 font-medium">Joueurs</th>
                <th className="px-3 py-2 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {pendingImports.map((item) => (
                <tr key={item.name} className="border-b border-border/60 last:border-0">
                  <td className="px-3 py-3 font-medium text-foreground">{item.name}</td>
                  <td className="px-3 py-3 text-foreground/90">{item.receivedAt}</td>
                  <td className="px-3 py-3 text-foreground/90">{item.players}</td>
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-foreground/90">
                      {item.status === "Prêt à publier" ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
                      ) : (
                        <ShieldCheck className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
                      )}
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Check className="h-4 w-4 text-primary" aria-hidden="true" />
            Checklist opérationnelle
          </div>
          <ul className="space-y-3 text-sm text-foreground/90">
            {checks.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Table2 className="h-4 w-4 text-primary" aria-hidden="true" />
            Actions rapides
          </div>
          <div className="space-y-3 text-sm">
            <Link
              href="/admin/classements"
              className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-foreground transition hover:bg-muted"
            >
              Préparer la publication des classements
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/admin/utilisateurs"
              className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-foreground transition hover:bg-muted"
            >
              Suivre les arbitres et validateurs
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
