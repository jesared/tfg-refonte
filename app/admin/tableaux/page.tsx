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

  await saveTableaux(tableaux);
  revalidatePath("/tableaux");
  revalidatePath("/admin/tableaux");
  redirect("/admin/tableaux?updated=1");
}

export default async function AdminTableauxPage({
  searchParams,
}: {
  searchParams?: Promise<{ updated?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const tableaux = await getTableaux();
  const params = await searchParams;
  const isUpdated = params?.updated === "1";

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="rounded-2xl border border-border bg-card px-6 py-7 shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Table2 className="h-4 w-4" aria-hidden="true" />
          Administration
        </div>
        <h1 className="mt-4 text-3xl font-semibold text-foreground">Modifier les tableaux</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Les modifications sont appliquées immédiatement sur la page publique
          <span className="font-medium text-foreground"> /tableaux</span>.
        </p>
      </header>

      {isUpdated && (
        <p className="rounded-xl border border-emerald-300/60 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-500/10 dark:text-emerald-200">
          ✅ Tableaux mis à jour.
        </p>
      )}

      <form action={updateTableaux} className="space-y-4">
        {tableaux.map((tableau) => (
          <section
            key={tableau.id}
            className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"
          >
            <input type="hidden" name="id" value={tableau.id} />
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Tableau #{tableau.id}</h2>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Nom</span>
                <input
                  required
                  name="title"
                  defaultValue={tableau.title}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Plage de points</span>
                <input
                  required
                  name="points"
                  defaultValue={tableau.points}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Heure de début</span>
                <input
                  required
                  name="start"
                  defaultValue={tableau.start}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                />
              </label>
            </div>
          </section>
        ))}

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
