import { CalendarDays, Check, ShieldCheck, Table2, Trophy, User } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/pages/api/auth/[...nextauth]";

export const metadata: Metadata = {
  title: "Admin - Classements",
  description: "Préparation des publications mensuelles des classements.",
};

const publicationSteps = [
  { label: "Collecte des résultats", owner: "Automatique", status: "Terminé" },
  { label: "Contrôle manuel des anomalies", owner: "Pôle sportif", status: "En cours" },
  { label: "Validation finale", owner: "Responsable classement", status: "À lancer" },
  { label: "Diffusion clubs & site", owner: "Communication", status: "Planifié" },
];

const trendCards = [
  { label: "Entrées dans le top 100", value: "+14", icon: Trophy },
  { label: "Dossiers en révision", value: "9", icon: ShieldCheck },
  { label: "Classements publiés", value: "11", icon: Check },
];

export default async function AdminClassementsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <header className="rounded-2xl border border-border bg-card px-6 py-7 shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          Pilotage mensuel
        </div>
        <h1 className="mt-4 text-3xl font-semibold text-foreground">Publication des classements</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Organisez les contrôles finaux et préparez les exports avant diffusion officielle aux clubs.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {trendCards.map((card) => (
          <article key={card.label} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2 text-primary">
              <card.icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="mt-1 text-3xl font-semibold text-foreground">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Check className="h-4 w-4 text-primary" aria-hidden="true" />
          Pipeline de publication
        </div>
        <ul className="space-y-3">
          {publicationSteps.map((step) => (
            <li
              key={step.label}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium text-foreground">{step.label}</p>
                <p className="text-muted-foreground">Responsable : {step.owner}</p>
              </div>
              <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-foreground/90">
                {step.status}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted"
        >
          <Table2 className="h-4 w-4" aria-hidden="true" />
          Exporter la version de contrôle
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm font-medium text-primary transition hover:bg-primary/15"
        >
          <User className="h-4 w-4" aria-hidden="true" />
          Préparer l&apos;envoi aux clubs
        </button>
      </section>
    </main>
  );
}
