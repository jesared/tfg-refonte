import { ShieldCheck, Trophy } from "lucide-react";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";


const INSCRIPTIONS_PATH = "/admin/inscriptions";

async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");
}

function getEngagementId(formData: FormData) {
  return String(formData.get("engagementId") ?? "").trim();
}

export const metadata: Metadata = {
  title: "Admin - Inscriptions",
  description: "Suivi des joueurs inscrits par tour et validation des inscriptions.",
};

async function validateEngagement(formData: FormData) {
  "use server";
  await requireAdminSession();
  const engagementId = getEngagementId(formData);
  if (!engagementId) redirect(`${INSCRIPTIONS_PATH}?updated=0`);
  await prisma.engagement.update({
    where: { id: engagementId },
    data: { statut: "VALIDE", licenceVerified: true },
  });
  revalidatePath(INSCRIPTIONS_PATH);
  redirect(`${INSCRIPTIONS_PATH}?updated=validated`);
}

async function resetEngagement(formData: FormData) {
  "use server";
  await requireAdminSession();
  const engagementId = getEngagementId(formData);
  if (!engagementId) redirect(`${INSCRIPTIONS_PATH}?updated=0`);
  await prisma.engagement.update({
    where: { id: engagementId },
    data: { statut: "EN_ATTENTE", licenceVerified: false },
  });
  revalidatePath(INSCRIPTIONS_PATH);
  redirect(`${INSCRIPTIONS_PATH}?updated=reset`);
}

async function deleteEngagement(formData: FormData) {
  "use server";
  await requireAdminSession();
  const engagementId = getEngagementId(formData);
  if (!engagementId) redirect(`${INSCRIPTIONS_PATH}?updated=0`);
  await prisma.engagement.delete({ where: { id: engagementId } });
  revalidatePath(INSCRIPTIONS_PATH);
  redirect(`${INSCRIPTIONS_PATH}?updated=deleted`);
}

function isPointsCompatible(points: number | null, minPoints: number | null, maxPoints: number | null) {
  if (points === null) return true;
  return (minPoints === null || points >= minPoints) && (maxPoints === null || points <= maxPoints);
}

async function updateEngagementCategories(formData: FormData) {
  "use server";
  await requireAdminSession();
  const engagementId = getEngagementId(formData);
  const selectedCategoryIds = Array.from(new Set(Array.from(formData.getAll("categoryIds")).map((v) => String(v))));
  const engagement = await prisma.engagement.findUnique({ where: { id: engagementId } });
  if (!engagement) redirect(`${INSCRIPTIONS_PATH}?updated=0`);

  const categories = await prisma.category.findMany({
    where: { id: { in: selectedCategoryIds }, tournamentId: engagement.tournamentId },
    select: { id: true, minPoints: true, maxPoints: true },
  });

  if (categories.length !== selectedCategoryIds.length) redirect(`${INSCRIPTIONS_PATH}?updated=0`);
  if (categories.some((c) => !isPointsCompatible(engagement.points, c.minPoints, c.maxPoints))) {
    redirect(`${INSCRIPTIONS_PATH}?updated=points_mismatch`);
  }

  await prisma.engagement.update({ where: { id: engagement.id }, data: { categoryIds: selectedCategoryIds } });
  revalidatePath(INSCRIPTIONS_PATH);
  redirect(`${INSCRIPTIONS_PATH}?updated=engagement_updated`);
}

export default async function AdminInscriptionsPage() {
  await requireAdminSession();

  const tournaments = await prisma.tournament.findMany({
    orderBy: [{ tour: "asc" }, { date: "asc" }],
    select: {
      id: true,
      nom: true,
      tour: true,
      date: true,
      salleVille: true,
      categories: { orderBy: { nom: "asc" }, select: { id: true, nom: true, minPoints: true, maxPoints: true } },
      engagements: {
        orderBy: [{ statut: "asc" }, { createdAt: "asc" }],
        select: { id: true, nom: true, prenom: true, numeroLicence: true, club: true, points: true, statut: true, categoryIds: true },
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

      {tournaments.map((tournament) => (
        <article key={tournament.id} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Tour {tournament.tour} · {tournament.nom}</h2>
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-foreground/90">
              <Trophy className="h-3.5 w-3.5 text-primary" aria-hidden="true" /> {tournament.engagements.length} inscrit{tournament.engagements.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead><tr className="border-b border-border text-muted-foreground"><th className="px-3 py-2">Joueur</th><th className="px-3 py-2">Licence</th><th className="px-3 py-2">Club</th><th className="px-3 py-2">Catégories</th><th className="px-3 py-2">Statut</th><th className="px-3 py-2">Actions</th></tr></thead>
              <tbody>
                {tournament.engagements.map((engagement) => {
                  const labels = tournament.categories.filter((c) => engagement.categoryIds.includes(c.id)).map((c) => c.nom);
                  const eligibleCategories = tournament.categories.filter((c) => isPointsCompatible(engagement.points, c.minPoints, c.maxPoints));
                  return (
                    <tr key={engagement.id} className="border-b border-border/60 last:border-0">
                      <td className="px-3 py-3">{engagement.prenom} {engagement.nom}</td>
                      <td className="px-3 py-3">{engagement.numeroLicence}</td>
                      <td className="px-3 py-3">{engagement.club}</td>
                      <td className="px-3 py-3">
                        <form action={updateEngagementCategories} className="space-y-2">
                          <input type="hidden" name="engagementId" value={engagement.id} />
                          <div className="flex flex-wrap gap-2">
                            {eligibleCategories.map((c) => (
                              <label key={c.id} className="inline-flex items-center gap-1 text-xs">
                                <input type="checkbox" name="categoryIds" value={c.id} defaultChecked={engagement.categoryIds.includes(c.id)} /> {c.nom}
                              </label>
                            ))}
                          </div>
                          <button type="submit" className="rounded border px-2 py-1 text-xs">Mettre à jour</button>
                        </form>
                        <p className="text-xs text-muted-foreground mt-1">Actuel: {labels.join(" · ") || "-"}</p>
                      </td>
                      <td className="px-3 py-3">{engagement.statut}</td>
                      <td className="px-3 py-3 space-y-2">
                        <form action={validateEngagement}><input type="hidden" name="engagementId" value={engagement.id} /><button type="submit" className="rounded border px-2 py-1 text-xs">Valider</button></form>
                        <form action={resetEngagement}><input type="hidden" name="engagementId" value={engagement.id} /><button type="submit" className="rounded border px-2 py-1 text-xs">Remettre</button></form>
                        <form action={deleteEngagement}><input type="hidden" name="engagementId" value={engagement.id} /><button type="submit" className="rounded border px-2 py-1 text-xs">Supprimer</button></form>
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
