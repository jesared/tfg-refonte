import { CalendarDays, Check, ShieldCheck, Trophy } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { SyncFacebookButton } from "@/components/admin/SyncFacebookButton";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export const metadata: Metadata = {
  title: "Admin - Tableau de bord",
  description: "Pilotage de l'administration du Trophée François Grieder.",
};

const stats = [
  {
    label: "Tournois suivis",
    value: "18",
    detail: "Saison 2025-2026",
    icon: CalendarDays,
  },
  {
    label: "Joueurs classés",
    value: "412",
    detail: "Toutes catégories",
    icon: Trophy,
  },
  {
    label: "Actions en attente",
    value: "7",
    detail: "Validation manuelle",
    icon: ShieldCheck,
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
          Espace interne pour suivre les indicateurs du challenge et préparer les prochaines actions.
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Synchronisation des contenus Facebook</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Déclenche une mise à jour manuelle des publications affichées sur le site.
            </p>
          </div>
          <SyncFacebookButton user={session.user} />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Check className="h-4 w-4 text-primary" aria-hidden="true" />
          Prochaines améliorations proposées
        </div>
        <ul className="mt-4 space-y-3 text-sm text-foreground/90">
          <li>• Ajouter un filtre par département pour le suivi des résultats.</li>
          <li>• Créer une page de validation rapide des tournois importés.</li>
          <li>• Connecter un export CSV des classements mensuels.</li>
        </ul>
      </section>
    </main>
  );
}
