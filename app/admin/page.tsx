import { CalendarDays, Check, Image, ShieldCheck, Trophy, User } from "lucide-react";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

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

const quickAccess = [
  {
    title: "Debrief fonctionnalités",
    description: "Consulter la synthèse des nouveautés admin et la roadmap d'amélioration.",
    href: "/admin/debrief",
    icon: Check,
  },
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
  {
    title: "Uploads d'images",
    description: "Ajouter des visuels administrateur et récupérer une URL prête à publier.",
    href: "/admin/uploads",
    icon: Image,
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
          <article
            key={item.label}
            className="rounded-xl border border-border bg-card p-5 shadow-sm"
          >
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
