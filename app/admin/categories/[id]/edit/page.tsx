import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { EditCategoryForm } from "@/app/admin/categories/_components/EditCategoryForm";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const { id } = await params;

  const category = await prisma.category.findUnique({
    where: { id },
    select: { id: true, nom: true, horaire: true, minPoints: true, maxPoints: true, maxJoueurs: true, tournamentId: true },
  });

  if (!category) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-3xl space-y-4 p-8">
      <header className="space-y-1">
        <Link href={`/admin/tournaments/${category.tournamentId}`} className="text-sm text-blue-600">
          ← Retour au tournoi
        </Link>
        <h1 className="text-2xl font-bold">Modifier la catégorie</h1>
        <p className="text-sm text-gray-500">La modification est appliquée à tous les tours.</p>
      </header>

      <EditCategoryForm
        category={category}
        backHref={`/admin/tournaments/${category.tournamentId}`}
      />
    </main>
  );
}
