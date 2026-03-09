import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { NewCategoryForm } from "@/app/admin/categories/_components/NewCategoryForm";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export default async function NewCategoryPage({
  searchParams,
}: {
  searchParams: Promise<{ tournamentId?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const { tournamentId } = await searchParams;

  const tournaments = await prisma.tournament.findMany({
    orderBy: [{ date: "desc" }],
    select: { id: true, nom: true, date: true, tour: true },
  });

  return (
    <main className="mx-auto w-full max-w-3xl space-y-4 p-8">
      <header className="space-y-1">
        <Link href="/admin/tournaments" className="text-sm text-blue-600">
          ← Retour aux tournois
        </Link>
        <h1 className="text-2xl font-bold">Nouvelle catégorie</h1>
        <p className="text-sm text-gray-500">Créer une catégorie liée à un tournoi, selon le schéma Prisma.</p>
      </header>

      <NewCategoryForm
        tournaments={tournaments.map((item) => ({ ...item, date: item.date.toISOString() }))}
        defaultTournamentId={tournamentId}
      />
    </main>
  );
}
