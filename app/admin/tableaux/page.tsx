import { Check, Table2 } from "lucide-react";
import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { getTableaux, saveTableaux } from "@/lib/tableaux";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export const metadata: Metadata = {
  title: "Admin - Tableaux",
  description: "Modification des tableaux affichés sur le site public.",
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

  const length = Math.min(ids.length, titles.length, points.length, starts.length);

  const tableaux = Array.from({ length }, (_, index) => ({
    id: Number(ids[index]),
    title: String(titles[index] ?? "").trim(),
    points: String(points[index] ?? "").trim(),
    start: String(starts[index] ?? "").trim(),
  })).filter(
    (tableau) => Number.isFinite(tableau.id) && tableau.title && tableau.points && tableau.start,
  );

  const { usedTemporaryStorage } = await saveTableaux(tableaux);
  revalidatePath("/tableaux");
  revalidatePath("/admin/tableaux");
  redirect(`/admin/tableaux?updated=1${usedTemporaryStorage ? "&storage=tmp" : ""}`);
}

export default async function AdminTableauxPage({
  searchParams,
}: {
  searchParams?: Promise<{ updated?: string; storage?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const tableaux = await getTableaux();
  const params = await searchParams;
  const isUpdated = params?.updated === "1";
  const usedTemporaryStorage = params?.storage === "tmp";

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-5">
      <header className="rounded-2xl border border-border/70 bg-card/80 px-5 py-6 shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Table2 className="h-4 w-4" aria-hidden="true" />
          Administration
        </div>
        <h1 className="mt-3 text-2xl font-semibold text-foreground">Modifier les tableaux</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Les modifications sont appliquées immédiatement sur la page publique
          <span className="font-medium text-foreground"> /tableaux</span>.
        </p>
      </header>

      {isUpdated && (
        <p className="rounded-xl border border-emerald-300/60 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-500/10 dark:text-emerald-200">
          ✅ Tableaux mis à jour.
        </p>
      )}


      {isUpdated && usedTemporaryStorage && (
        <p className="rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-200">
          ⚠️ Environnement en lecture seule détecté : les tableaux sont enregistrés temporairement.
          Configurez <code className="mx-1 rounded bg-background px-1 py-0.5 text-xs">TABLEAUX_FILE_PATH</code>
          vers un stockage persistant pour conserver les modifications.
        </p>
      )}

      <form action={updateTableaux} className="space-y-4">
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="grid grid-cols-[72px_1fr_1fr_120px] gap-px bg-border/70 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <p className="bg-muted/40 px-3 py-2.5">#</p>
            <p className="bg-muted/40 px-3 py-2.5">Nom</p>
            <p className="bg-muted/40 px-3 py-2.5">Plage de points</p>
            <p className="bg-muted/40 px-3 py-2.5">Début</p>
          </div>

          <div className="divide-y divide-border/70">
            {tableaux.map((tableau) => (
              <div key={tableau.id} className="grid grid-cols-1 gap-3 px-3 py-3 sm:grid-cols-[72px_1fr_1fr_120px] sm:items-center">
                <input type="hidden" name="id" value={tableau.id} />
                <p className="text-sm font-semibold text-foreground">#{tableau.id}</p>
                <input
                  required
                  name="title"
                  defaultValue={tableau.title}
                  aria-label={`Nom du tableau ${tableau.id}`}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
                <input
                  required
                  name="points"
                  defaultValue={tableau.points}
                  aria-label={`Plage de points du tableau ${tableau.id}`}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
                <input
                  required
                  name="start"
                  defaultValue={tableau.start}
                  aria-label={`Heure de début du tableau ${tableau.id}`}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </div>
            ))}
          </div>
        </section>

        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          <Check className="h-4 w-4" aria-hidden="true" />
          Enregistrer les modifications
        </button>
      </form>
    </main>
  );
}
