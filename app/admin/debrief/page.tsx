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
  title: "Admin - Debrief fonctionnalités",
  description:
    "Synthèse des dernières évolutions admin et plan d'améliorations proposées.",
};

const featureBlocks = [
  {
    title: "Menu d’actions sur les tournois",
    icon: Trophy,
    summary:
      "Une colonne Actions a été ajoutée pour gérer rapidement chaque tournoi depuis la même ligne.",
    points: [
      "Accès direct à la gestion des inscriptions.",
      "Lien rapide vers la modification d'un tournoi.",
      "Suppression sécurisée avec confirmation utilisateur.",
    ],
  },
  {
    title: "Tableau tournois harmonisé",
    icon: CalendarDays,
    summary:
      "La page Tournois admin a été structurée avec un en-tête, des KPI et des statuts explicites.",
    points: [
      "Lecture instantanée des tournois passés et des inscriptions ouvertes.",
      "Tri du plus récent au plus ancien pour le pilotage opérationnel.",
      "Meilleure lisibilité globale des actions à lancer.",
    ],
  },
  {
    title: "Gestion des rôles renforcée",
    icon: ShieldCheck,
    summary:
      "La mise à jour des rôles applique des garde-fous serveur pour éviter les incohérences.",
    points: [
      "Validation stricte des rôles autorisés.",
      "Blocage des cas à risque (dernier admin, auto-rétrogradation).",
      "Feedback explicite en cas de succès ou d'erreur.",
    ],
  },
  {
    title: "Sélecteur de rôle modernisé",
    icon: User,
    summary:
      "Le composant de sélection a été aligné avec la charte UI pour une action plus fluide.",
    points: [
      "Style cohérent avec le design system.",
      "Focus et lisibilité améliorés.",
      "Soumission automatique pour accélérer le workflow.",
    ],
  },
];

const improvementPlan = [
  {
    horizon: "Quick wins (1-2 semaines)",
    items: [
      "Ajouter une recherche + filtres (statut, date, tour) sur la liste des tournois.",
      "Afficher un compteur d'inscriptions par tournoi directement dans le tableau.",
      "Ajouter un toast de confirmation après chaque action (édition, suppression, rôle).",
    ],
  },
  {
    horizon: "Structurant (1-2 mois)",
    items: [
      "Mettre en place un journal d'audit des actions admin (qui, quoi, quand).",
      "Créer des rôles intermédiaires (éditeur, valideur) avec permissions ciblées.",
      "Ajouter une page de santé admin (alertes sur tournois incomplets, dates incohérentes, etc.).",
    ],
  },
  {
    horizon: "Vision produit (trimestre)",
    items: [
      "Construire un centre de pilotage avec tendances d'inscription par période.",
      "Automatiser des contrôles qualité pré-publication (checklist des données manquantes).",
      "Prévoir un mode “brouillon / publication” sur les contenus sensibles.",
    ],
  },
];

export default async function AdminDebriefPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <header className="rounded-2xl border border-border bg-card px-6 py-7 shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Check className="h-4 w-4" aria-hidden="true" />
          Debrief admin
        </div>
        <h1 className="mt-4 text-3xl font-semibold text-foreground">Nouvelles fonctionnalités</h1>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground sm:text-base">
          Cette page centralise les évolutions récentes de l&apos;administration et propose une
          trajectoire d&apos;amélioration concrète, priorisée et orientée impact.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {featureBlocks.map((block) => (
          <article key={block.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2 text-primary">
              <block.icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">{block.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{block.summary}</p>
            <ul className="mt-4 space-y-2 text-sm text-foreground/90">
              {block.points.map((point) => (
                <li key={point} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Check className="h-4 w-4 text-primary" aria-hidden="true" />
          Points d&apos;amélioration proposés
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Proposition de roadmap pour accélérer l&apos;efficacité opérationnelle et renforcer la
          robustesse de l&apos;admin.
        </p>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {improvementPlan.map((track) => (
            <article key={track.horizon} className="rounded-xl border border-border/70 bg-muted/20 p-4">
              <h3 className="text-sm font-semibold text-foreground">{track.horizon}</h3>
              <ul className="mt-3 space-y-2 text-sm text-foreground/90">
                {track.items.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/admin/tournaments"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            Voir les tournois
            <span aria-hidden="true">→</span>
          </Link>
          <Link
            href="/admin/utilisateurs"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            Voir les utilisateurs
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
