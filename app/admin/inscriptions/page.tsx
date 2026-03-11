import { Check, ShieldCheck, Trophy, X } from "lucide-react";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

import { RegistrationActionMenu } from "./_components/registration-action-menu";

const INSCRIPTIONS_PATH = "/admin/inscriptions";

async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");
}

function getRegistrationId(formData: FormData) {
  return String(formData.get("registrationId") ?? "").trim();
}

export const metadata: Metadata = {
  title: "Admin - Inscriptions",
  description: "Suivi des joueurs inscrits par tour et validation des inscriptions.",
};

const STATUS_OPTIONS = ["all", "PENDING", "VALIDATED", "REJECTED", "CANCELED"] as const;
type StatusFilter = (typeof STATUS_OPTIONS)[number];
const CHECKIN_OPTIONS = ["all", "CHECKED_IN", "NOT_CHECKED_IN"] as const;
type CheckInFilter = (typeof CHECKIN_OPTIONS)[number];
function getStatusLabel(status: StatusFilter | (string & {})) {
  switch (status) {
    case "PENDING":
      return "En attente";
    case "VALIDATED":
      return "Validée";
    case "REJECTED":
      return "Refusée";
    case "CANCELED":
      return "Annulée";
    default:
      return "Tous statuts";
  }
}

function getCheckInLabel(status: CheckInFilter | (string & {})) {
  switch (status) {
    case "CHECKED_IN":
      return "Pointé";
    case "NOT_CHECKED_IN":
      return "Non pointé";
    default:
      return "Tous pointages";
  }
}

async function validateRegistration(formData: FormData) {
  "use server";
  await requireAdminSession();
  const registrationId = getRegistrationId(formData);
  if (!registrationId) redirect(`${INSCRIPTIONS_PATH}?updated=0`);
  await prisma.registration.update({
    where: { id: registrationId },
    data: { status: "VALIDATED", licenceVerified: true },
  });
  revalidatePath(INSCRIPTIONS_PATH);
  redirect(`${INSCRIPTIONS_PATH}?updated=validated`);
}

async function resetRegistration(formData: FormData) {
  "use server";
  await requireAdminSession();
  const registrationId = getRegistrationId(formData);
  if (!registrationId) redirect(`${INSCRIPTIONS_PATH}?updated=0`);
  await prisma.registration.update({
    where: { id: registrationId },
    data: { status: "PENDING", licenceVerified: false },
  });
  revalidatePath(INSCRIPTIONS_PATH);
  redirect(`${INSCRIPTIONS_PATH}?updated=reset`);
}

async function deleteRegistration(formData: FormData) {
  "use server";
  await requireAdminSession();
  const registrationId = getRegistrationId(formData);
  if (!registrationId) redirect(`${INSCRIPTIONS_PATH}?updated=0`);
  await prisma.registration.delete({ where: { id: registrationId } });
  revalidatePath(INSCRIPTIONS_PATH);
  redirect(`${INSCRIPTIONS_PATH}?updated=deleted`);
}

async function checkInRegistration(formData: FormData) {
  "use server";
  await requireAdminSession();
  const registrationId = getRegistrationId(formData);
  if (!registrationId) redirect(`${INSCRIPTIONS_PATH}?updated=0`);
  await prisma.registration.update({
    where: { id: registrationId },
    data: { checkInStatus: "CHECKED_IN" },
  });
  revalidatePath(INSCRIPTIONS_PATH);
  redirect(`${INSCRIPTIONS_PATH}?updated=checked_in`);
}

async function resetCheckInRegistration(formData: FormData) {
  "use server";
  await requireAdminSession();
  const registrationId = getRegistrationId(formData);
  if (!registrationId) redirect(`${INSCRIPTIONS_PATH}?updated=0`);
  await prisma.registration.update({
    where: { id: registrationId },
    data: { checkInStatus: "NOT_CHECKED_IN" },
  });
  revalidatePath(INSCRIPTIONS_PATH);
  redirect(`${INSCRIPTIONS_PATH}?updated=checkin_reset`);
}

function isPointsCompatible(
  points: number | null,
  minPoints: number | null,
  maxPoints: number | null,
) {
  if (points === null) return true;
  return (minPoints === null || points >= minPoints) && (maxPoints === null || points <= maxPoints);
}

async function updateRegistrationCategories(formData: FormData) {
  "use server";
  await requireAdminSession();
  const registrationId = getRegistrationId(formData);
  const selectedCategoryIds = Array.from(
    new Set(Array.from(formData.getAll("categoryIds")).map((v) => String(v))),
  );

  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    select: { id: true, tournamentId: true, player: { select: { points: true } } },
  });

  if (!registration) redirect(`${INSCRIPTIONS_PATH}?updated=0`);

  const categories = await prisma.category.findMany({
    where: { id: { in: selectedCategoryIds }, tournamentId: registration.tournamentId },
    select: { id: true, minPoints: true, maxPoints: true },
  });

  if (categories.length !== selectedCategoryIds.length) redirect(`${INSCRIPTIONS_PATH}?updated=0`);
  if (
    categories.some(
      (c) => !isPointsCompatible(registration.player.points, c.minPoints, c.maxPoints),
    )
  ) {
    redirect(`${INSCRIPTIONS_PATH}?updated=points_mismatch`);
  }

  await prisma.$transaction([
    prisma.engagement.deleteMany({ where: { registrationId: registration.id } }),
    prisma.engagement.createMany({
      data: selectedCategoryIds.map((categoryId) => ({
        registrationId: registration.id,
        categoryId,
      })),
    }),
  ]);

  revalidatePath(INSCRIPTIONS_PATH);
  redirect(`${INSCRIPTIONS_PATH}?updated=engagement_updated`);
}

export default async function AdminInscriptionsPage({
  searchParams,
}: {
  searchParams?: Promise<{ updated?: string; scope?: string; status?: string; checkIn?: string }>;
}) {
  await requireAdminSession();

  const params = await searchParams;
  const scope = params?.scope === "all" || params?.scope === "past" ? params.scope : "active";
  const statusFilter: StatusFilter = STATUS_OPTIONS.includes(
    (params?.status as StatusFilter) ?? "all",
  )
    ? ((params?.status as StatusFilter) ?? "all")
    : "all";
  const checkInFilter: CheckInFilter = CHECKIN_OPTIONS.includes(
    (params?.checkIn as CheckInFilter) ?? "all",
  )
    ? ((params?.checkIn as CheckInFilter) ?? "all")
    : "all";

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
      categories: {
        orderBy: { nom: "asc" },
        select: { id: true, nom: true, minPoints: true, maxPoints: true },
      },
      registrations: {
        orderBy: [{ status: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          status: true,
          checkInStatus: true,
          player: {
            select: { nom: true, prenom: true, numeroLicence: true, club: true, points: true },
          },
          engagements: { select: { categoryId: true } },
        },
      },
    },
  });

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <header className="rounded-2xl border border-border bg-card px-6 py-7 shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Administration
        </div>
        <h1 className="mt-4 text-3xl font-semibold text-foreground">Inscriptions</h1>
      </header>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
          <p className="text-sm text-muted-foreground">
            Affichage des tours <strong className="text-foreground">à venir / en cours</strong> par
            défaut.
          </p>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <a
              href={`/admin/inscriptions?scope=active&status=${statusFilter}&checkIn=${checkInFilter}`}
              className={`rounded-full border px-3 py-1.5 transition ${
                scope === "active"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-muted"
              }`}
            >
              À venir / en cours
            </a>
            <a
              href={`/admin/inscriptions?scope=all&status=${statusFilter}&checkIn=${checkInFilter}`}
              className={`rounded-full border px-3 py-1.5 transition ${
                scope === "all"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-muted"
              }`}
            >
              Tous
            </a>
            <a
              href={`/admin/inscriptions?scope=past&status=${statusFilter}&checkIn=${checkInFilter}`}
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
          <p className="text-sm text-muted-foreground">Filtre de statut des inscriptions.</p>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            {STATUS_OPTIONS.map((status) => (
              <a
                key={status}
                href={`/admin/inscriptions?scope=${scope}&status=${status}&checkIn=${checkInFilter}`}
                className={`rounded-full border px-3 py-1.5 transition ${
                  statusFilter === status
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:bg-muted"
                }`}
              >
                {getStatusLabel(status)}
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
          <p className="text-sm text-muted-foreground">Filtre du pointage à l&apos;accueil.</p>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            {CHECKIN_OPTIONS.map((checkInStatus) => (
              <a
                key={checkInStatus}
                href={`/admin/inscriptions?scope=${scope}&status=${statusFilter}&checkIn=${checkInStatus}`}
                className={`rounded-full border px-3 py-1.5 transition ${
                  checkInFilter === checkInStatus
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:bg-muted"
                }`}
              >
                {getCheckInLabel(checkInStatus)}
              </a>
            ))}
          </div>
        </div>
      </section>

      {tournaments
        .map((tournament) => ({
          ...tournament,
          displayedRegistrations: tournament.registrations.filter((registration) => {
            const matchesStatus = statusFilter === "all" || registration.status === statusFilter;
            const matchesCheckIn =
              checkInFilter === "all" || registration.checkInStatus === checkInFilter;
            return matchesStatus && matchesCheckIn;
          }),
        }))
        .filter((tournament) => tournament.displayedRegistrations.length > 0)
        .map((tournament) => (
          <article
            key={tournament.id}
            className="rounded-2xl border border-border bg-card p-6 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                Tour {tournament.tour} · {tournament.salleVille}
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-foreground/90">
                <Trophy className="h-3.5 w-3.5 text-primary" aria-hidden="true" />{" "}
                {tournament.displayedRegistrations.length} inscrit
                {tournament.displayedRegistrations.length > 1 ? "s" : ""}
              </span>
            </div>

            <div>
              <table className="w-full table-fixed text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="px-3 py-2">Joueur</th>
                    <th className="px-3 py-2">Licence</th>
                    <th className="px-3 py-2">Club</th>
                    <th className="px-3 py-2">Catégories</th>
                    <th className="px-3 py-2">Statut</th>
                    <th className="px-3 py-2">Pointage</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tournament.displayedRegistrations.map((registration) => {
                    const selectedCategoryIds = registration.engagements.map(
                      (engagement) => engagement.categoryId,
                    );
                    const labels = tournament.categories
                      .filter((c) => selectedCategoryIds.includes(c.id))
                      .map((c) => c.nom);
                    const eligibleCategories = tournament.categories.filter((c) =>
                      isPointsCompatible(registration.player.points, c.minPoints, c.maxPoints),
                    );
                    const canValidate = registration.status !== "VALIDATED";
                    const canReset = registration.status !== "PENDING";
                    return (
                      <tr key={registration.id} className="border-b border-border/60 last:border-0">
                        <td className="px-3 py-3">
                          {registration.player.prenom} {registration.player.nom}
                        </td>
                        <td className="px-3 py-3">{registration.player.numeroLicence}</td>
                        <td className="px-3 py-3">{registration.player.club}</td>
                        <td className="px-3 py-3">
                          <p className="font-semibold text-foreground">
                            {labels.join(" · ") || "-"}
                          </p>
                        </td>
                        <td className="px-3 py-3">{getStatusLabel(registration.status)}</td>
                        <td className="px-3 py-3">
                          {registration.checkInStatus === "CHECKED_IN" ? (
                            <span
                              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200"
                              title="Présent"
                              aria-label="Présent"
                            >
                              <Check className="h-3.5 w-3.5" aria-hidden="true" />
                              Présent
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200"
                              title="Absent"
                              aria-label="Absent"
                            >
                              <X className="h-3.5 w-3.5" aria-hidden="true" />
                              Absent
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <RegistrationActionMenu
                            registrationId={registration.id}
                            playerName={`${registration.player.prenom} ${registration.player.nom}`}
                            canValidate={canValidate}
                            canReset={canReset}
                            isCheckedIn={registration.checkInStatus === "CHECKED_IN"}
                            validateRegistration={validateRegistration}
                            resetRegistration={resetRegistration}
                            checkInRegistration={checkInRegistration}
                            resetCheckInRegistration={resetCheckInRegistration}
                            deleteRegistration={deleteRegistration}
                            editPopoverTarget={`edit-categories-${registration.id}`}
                          />
                          <div
                            id={`edit-categories-${registration.id}`}
                            popover="auto"
                            className="fixed left-1/2 top-1/2 z-20 w-[min(92vw,32rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-popover p-4 text-sm shadow-xl"
                          >
                            <h3 className="text-sm font-semibold text-foreground">
                              Modifier les catégories
                            </h3>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {registration.player.prenom} {registration.player.nom}
                            </p>
                            <form action={updateRegistrationCategories} className="mt-3 space-y-3">
                              <input type="hidden" name="registrationId" value={registration.id} />
                              <div className="flex flex-wrap gap-2">
                                {eligibleCategories.map((c) => (
                                  <label
                                    key={c.id}
                                    className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs"
                                  >
                                    <input
                                      type="checkbox"
                                      name="categoryIds"
                                      value={c.id}
                                      defaultChecked={selectedCategoryIds.includes(c.id)}
                                    />{" "}
                                    {c.nom}
                                  </label>
                                ))}
                              </div>
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  popoverTarget={`edit-categories-${registration.id}`}
                                  popoverTargetAction="hide"
                                  className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-muted"
                                >
                                  Annuler
                                </button>
                                <button
                                  type="submit"
                                  className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
                                >
                                  Enregistrer
                                </button>
                              </div>
                            </form>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </article>
        ))}
    </main>
  );
}
