import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { NewCategoryForm } from "@/app/admin/categories/_components/NewCategoryForm";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export default async function NewCategoryPage({
  searchParams,
}: {
  searchParams: Promise<{ tournamentId?: string | string[] }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const { tournamentId } = await searchParams;
  const normalizedTournamentId = Array.isArray(tournamentId) ? tournamentId[0] : tournamentId;

  const tournament = normalizedTournamentId
    ? await prisma.tournament.findUnique({
        where: { id: normalizedTournamentId },
        select: { id: true, nom: true },
      })
    : null;

  const backHref = tournament ? `/admin/tournaments/${tournament.id}` : "/admin/tournaments";


  return (
    <main className="mx-auto w-full max-w-3xl space-y-4 p-8">
      <header className="space-y-1">
        <Link href={backHref} className="text-sm text-blue-600">
          ← Retour aux tournois
        </Link>
        <h1 className="text-2xl font-bold">Nouvelle catégorie</h1>
        <p className="text-sm text-gray-500">
          {tournament
            ? `Créer une catégorie pour le tournoi “${tournament.nom}”.`
            : "Créer une catégorie commune à tous les tours."}
        </p>
      </header>

      <NewCategoryForm tournamentId={tournament?.id ?? null} backHref={backHref} />
    </main>
  );
}
