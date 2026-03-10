import { Check, ShieldCheck, Trophy, X } from "lucide-react";
import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

import { InlineActionForm } from "./_components/inline-action-form";

export const metadata: Metadata = {
  title: "Admin - Inscriptions",
  description: "Suivi des joueurs inscrits par tour et validation des inscriptions.",
};

async function validateRegistration(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const registrationId = String(formData.get("registrationId") ?? "").trim();

  if (!registrationId) {
    redirect("/admin/inscriptions?updated=0");
  }

  const existing = await prisma.registration.findUnique({
    where: { id: registrationId },
    select: { id: true },
  });

  if (!existing) {
    redirect("/admin/inscriptions?updated=0");
  }

  await prisma.registration.update({
    where: { id: registrationId },
    data: {
      statut: "VALIDE",
      licenceVerified: true,
    },
  });

  revalidatePath("/admin/inscriptions");
  redirect("/admin/inscriptions?updated=validated");
}

async function resetRegistration(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const registrationId = String(formData.get("registrationId") ?? "").trim();

  if (!registrationId) {
    redirect("/admin/inscriptions?updated=0");
  }

  const existing = await prisma.registration.findUnique({
    where: { id: registrationId },
    select: { id: true },
  });

  if (!existing) {
    redirect("/admin/inscriptions?updated=0");
  }

  await prisma.registration.update({
    where: { id: registrationId },
    data: {
      statut: "EN_ATTENTE",
      licenceVerified: false,
    },
  });

  revalidatePath("/admin/inscriptions");
  redirect("/admin/inscriptions?updated=reset");
}

async function deletePlayerRegistrations(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const registrationId = String(formData.get("registrationId") ?? "").trim();

  if (!registrationId) {
    redirect("/admin/inscriptions?updated=0");
  }

  const existing = await prisma.registration.findUnique({
    where: { id: registrationId },
    select: { numeroLicence: true },
  });

  if (!existing) {
    redirect("/admin/inscriptions?updated=0");
  }

  await prisma.registration.deleteMany({
    where: { numeroLicence: existing.numeroLicence },
  });

  revalidatePath("/admin/inscriptions");
  redirect("/admin/inscriptions?updated=deleted");
}

export default async function AdminInscriptionsPage({
  searchParams,
}: {
  searchParams?: Promise<{ updated?: string; scope?: string; status?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const params = await searchParams;
  const scope = params?.scope === "all" || params?.scope === "past" ? params.scope : "active";

  const statusFilter =
    params?.status === "VALIDE" || params?.status === "EN_ATTENTE" ? params.status : "all";

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tournamentDateFilter =
    scope === "all" ? {} : scope === "past" ? { lt: startOfToday } : { gte: startOfToday };

  const tournaments = await prisma.tournament.findMany({
    where: {
      ...(scope === "all" ? {} : { date: tournamentDateFilter }),
    },
    orderBy: [{ tour: "asc" }, { date: "asc" }],
    select: {
      id: true,
      nom: true,
      tour: true,
      date: true,
      salleVille: true,
      registrations: {
        where: statusFilter === "all" ? undefined : { statut: statusFilter },
        orderBy: [{ statut: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          nom: true,
          prenom: true,
          numeroLicence: true,
          club: true,
          statut: true,
          category: {
            select: {
              nom: true,
            },
          },
        },
      },
    },
  });

  const updateStatus = params?.updated;
  const isValidated = updateStatus === "validated";
  const isReset = updateStatus === "reset";
  const isDeleted = updateStatus === "deleted";

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <header className="rounded-2xl border border-border bg-card px-6 py-7 shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Administration
        </div>
        <h1 className="mt-4 text-3xl font-semibold text-foreground">Inscriptions</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Consultez la liste des inscrits par tour, avec leur catégorie, puis validez les dossiers
          en attente.
        </p>
      </header>

      {isValidated && (
        <p className="rounded-xl border border-emerald-300/60 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-500/10 dark:text-emerald-200">
          ✅ Inscription validée avec succès.
        </p>
      )}

      {isReset && (
        <p className="rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-200">
          ↩️ Inscription remise en attente.
        </p>
      )}

      {isDeleted && (
        <p className="rounded-xl border border-rose-300/60 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-400/40 dark:bg-rose-500/10 dark:text-rose-200">
          🗑️ Joueur supprimé avec tous ses engagements.
        </p>
      )}

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
          <p className="text-sm text-muted-foreground">
            Astuce volume : affichage par défaut des tournois{" "}
            <strong className="text-foreground">à venir / en cours</strong>.
          </p>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <a
              href="/admin/inscriptions?scope=active"
              className={`rounded-full border px-3 py-1.5 transition ${
                scope === "active"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-muted"
              }`}
            >
              À venir / en cours
            </a>
            <a
              href="/admin/inscriptions?scope=all"
              className={`rounded-full border px-3 py-1.5 transition ${
                scope === "all"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-muted"
              }`}
            >
              Tous
            </a>
            <a
              href="/admin/inscriptions?scope=past"
              className={`rounded-full border px-3 py-1.5 transition ${
                scope === "past"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-muted"
              }`}
            >
              Passés
            </a>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
          <p className="text-sm text-muted-foreground">
            Filtrer rapidement les dossiers <strong className="text-foreground">en attente</strong>{" "}
            ou <strong className="text-foreground">validés</strong>.
          </p>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <a
              href={`/admin/inscriptions?scope=${scope}&status=all`}
              className={`rounded-full border px-3 py-1.5 transition ${
                statusFilter === "all"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-muted"
              }`}
            >
              Tous statuts
            </a>
            <a
              href={`/admin/inscriptions?scope=${scope}&status=EN_ATTENTE`}
              className={`rounded-full border px-3 py-1.5 transition ${
                statusFilter === "EN_ATTENTE"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-muted"
              }`}
            >
              En attente
            </a>
            <a
              href={`/admin/inscriptions?scope=${scope}&status=VALIDE`}
              className={`rounded-full border px-3 py-1.5 transition ${
                statusFilter === "VALIDE"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-muted"
              }`}
            >
              Validés
            </a>
          </div>
        </div>

        {tournaments.length === 0 && (
          <p className="rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
            Aucun tournoi trouvé pour ce filtre.
          </p>
        )}

        {tournaments.map((tournament) => (
          <article
            key={tournament.id}
            className="rounded-2xl border border-border bg-card p-6 shadow-sm"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                {(() => {
                  const defaultRoundName = `Tour ${tournament.tour}`;
                  const title =
                    tournament.nom.trim().toLowerCase() === defaultRoundName.toLowerCase()
                      ? defaultRoundName
                      : `${defaultRoundName} · ${tournament.nom}`;

                  return <h2 className="text-xl font-semibold text-foreground">{title}</h2>;
                })()}
                <p className="text-sm text-muted-foreground">
                  {new Intl.DateTimeFormat("fr-FR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  }).format(tournament.date)}
                  {" · "}
                  {tournament.salleVille}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-foreground/90">
                <Trophy className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                {tournament.registrations.length} inscrit
                {tournament.registrations.length > 1 ? "s" : ""}
              </span>
            </div>

            {tournament.registrations.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
                Aucun inscrit sur ce tour pour le moment.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="px-3 py-2 font-medium">Joueur</th>
                      <th className="px-3 py-2 font-medium">Licence</th>
                      <th className="px-3 py-2 font-medium">Club</th>
                      <th className="px-3 py-2 font-medium">Catégorie</th>
                      <th className="px-3 py-2 font-medium">Statut</th>
                      <th className="px-3 py-2 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tournament.registrations.map((registration) => {
                      const canValidate = registration.statut !== "VALIDE";
                      const canReset = registration.statut !== "EN_ATTENTE";

                      return (
                        <tr
                          key={registration.id}
                          className="border-b border-border/60 last:border-0"
                        >
                          <td className="px-3 py-3 font-medium text-foreground">
                            {registration.prenom} {registration.nom}
                          </td>
                          <td className="px-3 py-3 text-foreground/90">
                            {registration.numeroLicence}
                          </td>
                          <td className="px-3 py-3 text-foreground/90">{registration.club}</td>
                          <td className="px-3 py-3 text-foreground/90">
                            {registration.category.nom}
                          </td>
                          <td className="px-3 py-3">
                            <span className="inline-flex rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-foreground/90">
                              {registration.statut}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex flex-wrap items-center gap-2">
                              {canValidate ? (
                                <InlineActionForm
                                  action={validateRegistration}
                                  registrationId={registration.id}
                                >
                                  <button
                                    type="submit"
                                    className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
                                  >
                                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                                    Valider
                                  </button>
                                </InlineActionForm>
                              ) : (
                                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-300">
                                  Déjà validée
                                </span>
                              )}

                              {canReset && (
                                <InlineActionForm action={resetRegistration} registrationId={registration.id}>
                                  <button
                                    type="submit"
                                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-muted"
                                  >
                                    Remettre en attente
                                  </button>
                                </InlineActionForm>
                              )}

                              <InlineActionForm
                                action={deletePlayerRegistrations}
                                registrationId={registration.id}
                                confirmMessage="Confirmer la suppression de ce joueur et de toutes ses inscriptions ?"
                              >
                                <button
                                  type="submit"
                                  className="inline-flex items-center gap-1 rounded-lg border border-rose-300/70 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200 dark:hover:bg-rose-500/20"
                                >
                                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                                  Supprimer joueur
                                </button>
                              </InlineActionForm>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}
