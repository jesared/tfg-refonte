import { Check, EllipsisVertical, ShieldCheck, Trophy, X } from "lucide-react";
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

function isPointsCompatible({
  points,
  minPoints,
  maxPoints,
}: {
  points: number | null;
  minPoints: number | null;
  maxPoints: number | null;
}) {
  if (points === null) {
    return true;
  }

  const isAboveMin = minPoints === null || points >= minPoints;
  const isBelowMax = maxPoints === null || points <= maxPoints;

  return isAboveMin && isBelowMax;
}

async function updateRegistrationEngagements(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const registrationId = String(formData.get("registrationId") ?? "").trim();
  const selectedCategoryIds = Array.from(formData.getAll("categoryIds"))
    .map((value) => String(value).trim())
    .filter(Boolean);

  if (!registrationId || selectedCategoryIds.length === 0) {
    redirect("/admin/inscriptions?updated=0");
  }

  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    select: {
      id: true,
      nom: true,
      prenom: true,
      numeroLicence: true,
      genre: true,
      club: true,
      points: true,
      statut: true,
      licenceVerified: true,
      present: true,
      userId: true,
      tournamentId: true,
    },
  });

  if (!registration) {
    redirect("/admin/inscriptions?updated=0");
  }

  const uniqueCategoryIds = Array.from(new Set(selectedCategoryIds));

  const categories = await prisma.category.findMany({
    where: {
      id: { in: uniqueCategoryIds },
      tournamentId: registration.tournamentId,
    },
    select: {
      id: true,
      minPoints: true,
      maxPoints: true,
    },
  });

  if (categories.length !== uniqueCategoryIds.length) {
    redirect("/admin/inscriptions?updated=0");
  }

  const hasInvalidPointsCategory = categories.some(
    (category) =>
      !isPointsCompatible({
        points: registration.points,
        minPoints: category.minPoints,
        maxPoints: category.maxPoints,
      }),
  );

  if (hasInvalidPointsCategory) {
    redirect("/admin/inscriptions?updated=points_mismatch");
  }

  const existingEngagements = await prisma.registration.findMany({
    where: {
      numeroLicence: registration.numeroLicence,
      tournamentId: registration.tournamentId,
    },
    select: {
      id: true,
      categoryId: true,
    },
  });

  const existingByCategory = new Map(
    existingEngagements.map((engagement) => [engagement.categoryId, engagement]),
  );

  const selectedSet = new Set(uniqueCategoryIds);

  const idsToDelete = existingEngagements
    .filter((engagement) => !selectedSet.has(engagement.categoryId))
    .map((engagement) => engagement.id);

  const categoriesToCreate = uniqueCategoryIds.filter(
    (categoryId) => !existingByCategory.has(categoryId),
  );

  await prisma.$transaction(async (tx) => {
    if (idsToDelete.length > 0) {
      await tx.registration.deleteMany({
        where: {
          id: { in: idsToDelete },
        },
      });
    }

    if (categoriesToCreate.length > 0) {
      await tx.registration.createMany({
        data: categoriesToCreate.map((categoryId) => ({
          nom: registration.nom,
          prenom: registration.prenom,
          numeroLicence: registration.numeroLicence,
          genre: registration.genre,
          club: registration.club,
          points: registration.points,
          statut: registration.statut,
          licenceVerified: registration.licenceVerified,
          present: registration.present,
          tournamentId: registration.tournamentId,
          categoryId,
          userId: registration.userId,
        })),
      });
    }
  });

  revalidatePath("/admin/inscriptions");
  redirect("/admin/inscriptions?updated=engagement_updated");
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
        orderBy: [{ statut: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          nom: true,
          prenom: true,
          numeroLicence: true,
          club: true,
          points: true,
          statut: true,
          categoryId: true,
          category: {
            select: {
              id: true,
              nom: true,
            },
          },
        },
      },
      categories: {
        orderBy: [{ minPoints: "asc" }, { nom: "asc" }],
        select: {
          id: true,
          nom: true,
          minPoints: true,
          maxPoints: true,
        },
      },
    },
  });

  const updateStatus = params?.updated;
  const isValidated = updateStatus === "validated";
  const isReset = updateStatus === "reset";
  const isDeleted = updateStatus === "deleted";
  const isEngagementUpdated = updateStatus === "engagement_updated";
  const isPointsMismatch = updateStatus === "points_mismatch";
  const isDuplicate = updateStatus === "duplicate";

  const displayedLicences = Array.from(
    new Set(
      tournaments.flatMap((tournament) =>
        tournament.registrations.map((registration) => registration.numeroLicence),
      ),
    ),
  );

  const playerEngagements =
    displayedLicences.length === 0
      ? []
      : await prisma.registration.findMany({
          where: {
            numeroLicence: { in: displayedLicences },
          },
          orderBy: [{ tournament: { date: "asc" } }, { createdAt: "asc" }],
          select: {
            numeroLicence: true,
            id: true,
            tournament: {
              select: {
                tour: true,
                nom: true,
                date: true,
              },
            },
            category: {
              select: {
                nom: true,
              },
            },
          },
        });

  const engagementsByLicence = playerEngagements.reduce<
    Record<
      string,
      Array<{ id: string; tournamentLabel: string; tournamentDate: Date; categoryName: string }>
    >
  >((acc, engagement) => {
    const defaultRoundName = `Tour ${engagement.tournament.tour}`;
    const tournamentLabel =
      engagement.tournament.nom.trim().toLowerCase() === defaultRoundName.toLowerCase()
        ? defaultRoundName
        : `${defaultRoundName} · ${engagement.tournament.nom}`;

    if (!acc[engagement.numeroLicence]) {
      acc[engagement.numeroLicence] = [];
    }

    acc[engagement.numeroLicence].push({
      id: engagement.id,
      tournamentLabel,
      tournamentDate: engagement.tournament.date,
      categoryName: engagement.category.nom,
    });

    return acc;
  }, {});

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

      {isEngagementUpdated && (
        <p className="rounded-xl border border-sky-300/60 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-700 dark:border-sky-400/40 dark:bg-sky-500/10 dark:text-sky-200">
          ✏️ Engagement modifié avec succès.
        </p>
      )}

      {isPointsMismatch && (
        <p className="rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-200">
          ⚠️ Catégorie non compatible avec les points du joueur.
        </p>
      )}

      {isDuplicate && (
        <p className="rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-200">
          ⚠️ Ce joueur est déjà engagé sur cette catégorie.
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

        {tournaments.map((tournament) => {
          const displayedRegistrations =
            statusFilter === "all"
              ? tournament.registrations
              : tournament.registrations.filter(
                  (registration) => registration.statut === statusFilter,
                );

          return (
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
                  {displayedRegistrations.length} inscrit
                  {displayedRegistrations.length > 1 ? "s" : ""}
                </span>
              </div>

              {displayedRegistrations.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
                  Aucun inscrit sur ce tour pour le moment.
                </p>
              ) : (
                <div>
                  <table className="w-full table-fixed text-left text-sm">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        <th className="w-[18%] px-3 py-2 font-medium">Joueur</th>
                        <th className="px-3 py-2 font-medium">Licence</th>
                        <th className="px-3 py-2 font-medium">Club</th>
                        <th className="w-[32%] px-3 py-2 font-medium">Catégorie</th>
                        <th className="px-3 py-2 font-medium">Statut</th>
                        <th className="px-3 py-2 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedRegistrations.map((registration) => {
                        const canValidate = registration.statut !== "VALIDE";
                        const canReset = registration.statut !== "EN_ATTENTE";
                        const allEngagements =
                          engagementsByLicence[registration.numeroLicence]?.filter(
                            (engagement) => engagement.id !== registration.id,
                          ) ?? [];

                        const eligibleCategories = tournament.categories.filter(
                          (category) =>
                            category.id === registration.category.id ||
                            isPointsCompatible({
                              points: registration.points,
                              minPoints: category.minPoints,
                              maxPoints: category.maxPoints,
                            }),
                        );

                        const selectedCategoryIds = tournament.registrations
                          .filter(
                            (engagement) => engagement.numeroLicence === registration.numeroLicence,
                          )
                          .map((engagement) => engagement.categoryId);

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
                            <td className="px-3 py-3 text-foreground/90 break-words">
                              {registration.club}
                            </td>
                            <td className="px-3 py-3 text-foreground/90">
                              <div className="flex flex-col gap-2">
                                <span className="text-xs font-semibold text-foreground">
                                  Engagement actuel : {registration.category.nom}
                                </span>
                                <span className="text-xs text-muted-foreground break-words">
                                  Points: {registration.points ?? "non renseignés"}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {allEngagements.length > 0 ? (
                                    <>
                                      Autres engagements :{" "}
                                      {allEngagements
                                        .map((engagement) => {
                                          const formattedDate = new Intl.DateTimeFormat("fr-FR", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                          }).format(engagement.tournamentDate);

                                          return `${engagement.tournamentLabel} (${formattedDate}) · ${engagement.categoryName}`;
                                        })
                                        .join(" | ")}
                                    </>
                                  ) : (
                                    "Autres engagements : aucun"
                                  )}
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <span className="inline-flex rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-foreground/90">
                                {registration.statut}
                              </span>
                            </td>
                            <td className="px-3 py-3">
                              <div className="relative inline-block">
                                <details className="group">
                                  <summary className="inline-flex cursor-pointer list-none items-center rounded-md bg-[#1e2238] p-2 text-[#c5cbf7] transition hover:bg-[#2a2f4b]">
                                    <EllipsisVertical className="h-4 w-4" aria-hidden="true" />
                                  </summary>
                                  <div className="absolute right-0 top-full z-10 mt-2 flex w-72 flex-col overflow-hidden rounded-md border border-[#3a3f5e] bg-[#4b4f6a] py-1 text-sm text-[#e4e7ff] shadow-xl">
                                    <InlineActionForm
                                      action={updateRegistrationEngagements}
                                      registrationId={registration.id}
                                    >
                                      <details>
                                        <summary className="cursor-pointer list-none px-3 py-2 text-left text-sm transition hover:bg-[#5c617d]">
                                          Modifier engagements
                                        </summary>
                                        <div className="space-y-2 px-3 pb-3 pt-1">
                                          <p className="text-xs text-[#d2d6f8]">
                                            Choisir un ou plusieurs tableaux
                                          </p>
                                          <div className="max-h-40 space-y-1 overflow-y-auto rounded border border-[#666a86] p-2">
                                            {eligibleCategories.map((category) => (
                                              <label
                                                key={category.id}
                                                className="flex items-start gap-2 text-xs text-[#e4e7ff]"
                                              >
                                                <input
                                                  type="checkbox"
                                                  name="categoryIds"
                                                  value={category.id}
                                                  defaultChecked={selectedCategoryIds.includes(
                                                    category.id,
                                                  )}
                                                />
                                                <span>
                                                  {category.nom}
                                                  {category.minPoints !== null ||
                                                  category.maxPoints !== null
                                                    ? ` (${category.minPoints ?? 0}-${category.maxPoints ?? "∞"} pts)`
                                                    : ""}
                                                </span>
                                              </label>
                                            ))}
                                          </div>
                                          <button
                                            type="submit"
                                            className="inline-flex items-center rounded-md border border-[#7f85aa] px-2 py-1 text-xs transition hover:bg-[#5c617d]"
                                          >
                                            Enregistrer
                                          </button>
                                        </div>
                                      </details>
                                    </InlineActionForm>

                                    {canValidate ? (
                                      <InlineActionForm
                                        action={validateRegistration}
                                        registrationId={registration.id}
                                      >
                                        <button
                                          type="submit"
                                          className="inline-flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-[#5c617d]"
                                        >
                                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                                          Valider
                                        </button>
                                      </InlineActionForm>
                                    ) : (
                                      <span className="px-3 py-2 text-sm text-emerald-200">
                                        Déjà validée
                                      </span>
                                    )}

                                    {canReset && (
                                      <InlineActionForm
                                        action={resetRegistration}
                                        registrationId={registration.id}
                                      >
                                        <button
                                          type="submit"
                                          className="inline-flex w-full items-center px-3 py-2 text-left text-sm transition hover:bg-[#5c617d]"
                                        >
                                          Remettre en attente
                                        </button>
                                      </InlineActionForm>
                                    )}

                                    <div className="my-1 border-t border-[#666a86]" />

                                    <InlineActionForm
                                      action={deletePlayerRegistrations}
                                      registrationId={registration.id}
                                      confirmMessage="Confirmer la suppression de ce joueur et de toutes ses inscriptions ?"
                                    >
                                      <button
                                        type="submit"
                                        className="inline-flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-rose-300 transition hover:bg-[#5c617d] hover:text-rose-200"
                                      >
                                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                                        Supprimer joueur
                                      </button>
                                    </InlineActionForm>
                                  </div>
                                </details>
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
          );
        })}
      </section>
    </main>
  );
}
