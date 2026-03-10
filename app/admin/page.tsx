import {
  CalendarDays,
  Check,
  ShieldCheck,
  Trophy,
  User,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/pages/api/auth/[...nextauth]";

export const metadata: Metadata = {
  title: "Admin - Tableau de bord",
  description: "Pilotage de l'administration du Trophée François Grieder.",
};

const stats = [
  {
    label: "Tours agenda publiés",
    value: "9",
    detail: "Saison 2025-2026",
    icon: CalendarDays,
  },
  {
    label: "Tableaux actifs",
    value: "14",
    detail: "Synchronisés côté public",
    icon: Trophy,
  },
  {
    label: "Actions admin à planifier",
    value: "6",
    detail: "Qualité + sécurité",
    icon: ShieldCheck,
  },
];

const improvementTracks = [
  {
    title: "Agenda & salles",
    ideas: [
      "Ajouter un mode brouillon/publication pour préparer les changements sans impacter le site.",
      "Détecter automatiquement les doublons de salle, de date ou de club au moment de l'enregistrement.",
    ],
  },
  {
    title: "Tableaux",
    ideas: [
      "Proposer un aperçu avant publication pour contrôler le rendu exact de la page publique.",
      "Ajouter une validation des points (format + cohérence) avec messages d'erreur ligne par ligne.",
    ],
  },
  {
    title: "Utilisateurs",
    ideas: [
      "Créer un journal d'audit consultable depuis l'admin pour chaque changement de rôle.",
      "Mettre en place des rôles intermédiaires (éditeur/validateur) pour limiter les droits admin complets.",
    ],
  },
];

const quickAccess = [
  {
    title: "Tournois",
    description: "Créer un nouveau tournoi, gérer les catégories et préparer les éditions.",
    href: "/admin/tournois",
    icon: Trophy,
  },
  {
    title: "Inscriptions",
    description: "Suivre les inscriptions validées et traiter les demandes en attente.",
    href: "/admin/inscriptions",
    icon: Check,
  },
  {
    title: "Utilisateurs",
    description: "Ajuster les rôles et vérifier les accès de l'équipe organisatrice.",
    href: "/admin/utilisateurs",
    icon: User,
  },
];

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <header className="rounded-2xl border border-border bg-card px-6 py-7 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Admin</p>
        <h1 className="mt-3 text-3xl font-semibold text-foreground">Tableau de bord</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Espace interne pour suivre les indicateurs essentiels et prioriser les améliorations des
          pages d&apos;administration.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((item) => (
          <article key={item.label} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2 text-primary">
              <item.icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className="mt-1 text-3xl font-semibold text-foreground">{item.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Check className="h-4 w-4 text-primary" aria-hidden="true" />
          Propositions d&apos;amélioration prioritaires
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {improvementTracks.map((track) => (
            <article key={track.title} className="rounded-xl border border-border/70 bg-muted/20 p-4">
              <h2 className="text-sm font-semibold text-foreground">{track.title}</h2>
              <ul className="mt-3 space-y-2 text-sm text-foreground/90">
                {track.ideas.map((idea) => (
                  <li key={idea}>• {idea}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Accès rapides</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Raccourcis vers les sections les plus utilisées de l&apos;administration.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {quickAccess.map((item) => (
            <article
              key={item.title}
              className="rounded-xl border border-border/70 bg-muted/20 p-4 transition-colors hover:border-primary/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  Ouvrir
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
              <h3 className="mt-4 text-sm font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
