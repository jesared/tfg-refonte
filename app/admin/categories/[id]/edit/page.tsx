import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { EditCategoryForm } from "@/app/admin/categories/_components/EditCategoryForm";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export default async function EditCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ scope?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const { id } = await params;
  const { scope } = await searchParams;
  const roundScope = scope === "round";

  const category = await prisma.category.findUnique({
    where: { id },
    select: {
      id: true,
      nom: true,
      heureDebut: true,
      heureFin: true,
      minPoints: true,
      maxPoints: true,
      maxJoueurs: true,
      tournamentId: true,
      tournament: { select: { tour: true } },
    },
  });

  if (!category) {
    notFound();
  }

  const backHref = roundScope ? `/admin/tournaments/${category.tournamentId}` : "/admin/categories";

  return (
    <main className="mx-auto w-full max-w-3xl space-y-4 p-8">
      <header className="space-y-1">
        <Link href={backHref} className="text-sm text-blue-600">
          ← Retour
        </Link>
        <h1 className="text-2xl font-bold">Modifier la catégorie</h1>
        <p className="text-sm text-gray-500">
          {roundScope
            ? `Les réglages sont communs à tous les tours, sauf “Max joueurs” qui s'applique uniquement au tour ${category.tournament.tour}.`
            : "Les réglages sont communs à tous les tours (la limite de joueurs reste propre à chaque tour)."}
        </p>
      </header>

      <EditCategoryForm
        category={{
          ...category,
          heureDebut: category.heureDebut.toISOString().slice(11, 16),
          heureFin: category.heureFin ? category.heureFin.toISOString().slice(11, 16) : null,
        }}
        backHref={backHref}
        allowEditMaxJoueurs={roundScope}
      />
    </main>
  );
}
