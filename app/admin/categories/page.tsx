import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { CategoryActions } from "@/app/admin/categories/_components/CategoryActions";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export default async function AdminCategoriesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const categories = await prisma.category.findMany({
    orderBy: [{ nom: "asc" }, { tournament: { tour: "asc" } }],
    include: {
      tournament: {
        select: { id: true, tour: true, nom: true },
      },
      _count: {
        select: { registrations: true },
      },
    },
  });

  const groupedCategories = Object.values(
    categories.reduce<Record<string, typeof categories>>((acc, category) => {
      acc[category.nom] = acc[category.nom] ?? [];
      acc[category.nom].push(category);
      return acc;
    }, {}),
  );

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 p-8">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Catégories</h1>
          <p className="text-sm text-gray-500">Gérez les catégories communes à tous les tours.</p>
        </div>
        <Link href="/admin/categories/new" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          + Ajouter une catégorie
        </Link>
      </header>

      {groupedCategories.length === 0 ? (
        <section className="rounded border p-6 text-sm text-gray-500">Aucune catégorie créée pour le moment.</section>
      ) : (
        <section className="overflow-hidden rounded border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Horaires</th>
                <th className="px-4 py-3">Points</th>
                <th className="px-4 py-3">Max joueurs</th>
                <th className="px-4 py-3">Tours</th>
                <th className="px-4 py-3">Inscriptions</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {groupedCategories.map((group) => {
                const sample = group[0];
                const tours = group.map((item) => item.tournament.tour).join(", ");
                const totalRegistrations = group.reduce((sum, item) => sum + item._count.registrations, 0);

                return (
                  <tr key={sample.nom} className="border-t align-top">
                    <td className="px-4 py-3 font-medium">{sample.nom}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(sample.heureDebut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      {sample.heureFin
                        ? ` - ${new Date(sample.heureFin).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                        : ""}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {sample.minPoints ?? "-∞"} → {sample.maxPoints ?? "+∞"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{group.map((item) => `T${item.tournament.tour}: ${item.maxJoueurs ?? "∞"}`).join(" · ")}</td>
                    <td className="px-4 py-3 text-muted-foreground">{tours}</td>
                    <td className="px-4 py-3 text-muted-foreground">{totalRegistrations}</td>
                    <td className="px-4 py-3">
                      <CategoryActions categoryId={sample.id} categoryName={sample.nom} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}
