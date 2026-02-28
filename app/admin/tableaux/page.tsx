import { Check, Table2, X } from "lucide-react";
import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { TableauxEditor } from "@/components/admin/tableaux-editor";
import { getTableaux, saveTableaux } from "@/lib/tableaux";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export const metadata: Metadata = {
  title: "Admin - Tableaux",
  description: "Gestion des tableaux côté administration.",
};

async function updateTableaux(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const ids = formData.getAll("id");
  const titles = formData.getAll("title");
  const points = formData.getAll("points");
  const starts = formData.getAll("start");

  const tableaux = ids
    .map((id, index) => ({
      id: Number(id),
      title: String(titles[index] ?? "").trim(),
      points: String(points[index] ?? "").trim(),
      start: String(starts[index] ?? "").trim(),
    }))
    .filter((item) => Number.isFinite(item.id) && item.title && item.points && item.start);

  const tableaux = Array.from({ length }, (_, index) => ({
    id: Number(ids[index]),
    title: String(titles[index] ?? "").trim(),
    points: String(points[index] ?? "").trim(),
    start: String(starts[index] ?? "").trim(),
  })).filter((item) => Number.isFinite(item.id) && item.id > 0 && item.title && item.points && item.start);

  const result = await saveTableaux(tableaux);

  revalidatePath("/tableaux");
  revalidatePath("/admin/tableaux");

  redirect(
    `/admin/tableaux?updated=1${result.storage === "tmp" ? "&storage=tmp" : ""}${
      result.databaseAvailable ? "" : "&db=0"
    }`,
  );
}

export default async function AdminTableauxPage({
  searchParams,
}: {
  searchParams?: Promise<{ ok?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const tableaux = await getTableaux();
  const params = await searchParams;

  const isUpdated = params?.updated === "1";
  const usedTemporaryStorage = params?.storage === "tmp";
  const databaseAvailable = params?.db !== "0";

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <header className="rounded-2xl border border-border/70 bg-card/80 px-5 py-6 shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Table2 className="h-4 w-4" aria-hidden="true" />
          Administration
        </div>
        <h1 className="mt-3 text-2xl font-semibold text-foreground">Gestion des tableaux</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tu peux <span className="font-medium text-foreground">ajouter</span>, <span className="font-medium text-foreground">modifier</span> et
          <span className="font-medium text-foreground"> supprimer</span> des tableaux puis enregistrer.
        </p>
      </header>

      {isUpdated && (
        <p className="inline-flex items-center gap-2 rounded-xl border border-emerald-300/60 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-500/10 dark:text-emerald-200">
          <Check className="h-4 w-4" aria-hidden="true" />
          Tableaux mis à jour.
        </p>
      )}

      {isUpdated && !databaseAvailable && (
        <p className="inline-flex items-center gap-2 rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-200">
          <X className="h-4 w-4" aria-hidden="true" />
          La BDD n&apos;est pas joignable : sauvegarde effectuée sur fichier.
        </p>
      )}

      {isUpdated && usedTemporaryStorage && (
        <p className="inline-flex items-center gap-2 rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-200">
          <X className="h-4 w-4" aria-hidden="true" />
          Stockage temporaire utilisé (lecture seule détectée).
        </p>
      )}

      <form action={updateTableaux} className="space-y-4">
        <TableauxEditor initialTableaux={tableaux} />

        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          <Check className="h-4 w-4" aria-hidden="true" />
          Enregistrer
        </button>
      </form>
    </main>
  );
}
