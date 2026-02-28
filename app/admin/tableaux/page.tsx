import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { getTableaux, saveTableaux } from "@/lib/tableaux";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export const metadata: Metadata = {
  title: "Admin - Tableaux",
  description: "Modification simple des tableaux.",
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

  await saveTableaux(tableaux);
  revalidatePath("/tableaux");
  revalidatePath("/admin/tableaux");
  redirect("/admin/tableaux?ok=1");
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

  return (
    <main className="mx-auto w-full max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">/admin/tableaux</h1>
      <p className="text-sm text-muted-foreground">Version simplifiée : modifie les champs puis enregistre.</p>

      {params?.ok === "1" && (
        <p className="rounded border border-green-600 bg-green-50 px-3 py-2 text-sm text-green-700">
          Modifications enregistrées.
        </p>
      )}

      <form action={updateTableaux} className="space-y-3">
        {tableaux.map((tableau) => (
          <div key={tableau.id} className="grid grid-cols-1 gap-2 rounded border p-3 md:grid-cols-4">
            <input type="hidden" name="id" value={tableau.id} />
            <p className="font-medium">Tableau {tableau.id}</p>
            <input
              name="title"
              defaultValue={tableau.title}
              required
              className="rounded border px-2 py-1"
              placeholder="Nom"
            />
            <input
              name="points"
              defaultValue={tableau.points}
              required
              className="rounded border px-2 py-1"
              placeholder="Plage de points"
            />
            <input
              name="start"
              defaultValue={tableau.start}
              required
              className="rounded border px-2 py-1"
              placeholder="Heure"
            />
          </div>
        ))}

        <button type="submit" className="rounded bg-black px-4 py-2 text-white">
          Enregistrer
        </button>
      </form>
    </main>
  );
}
