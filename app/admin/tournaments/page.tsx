import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

export default async function TournamentsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const tournaments = await prisma.tournament.findMany({
    orderBy: [{ date: "desc" }],
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Tournois</h1>

      <Link href="/admin/tournaments/new" className="bg-blue-600 text-white px-4 py-2 rounded">
        + Nouveau tournoi
      </Link>

      <div className="mt-6 space-y-4">
        {tournaments.map((t) => (
          <div key={t.id} className="border p-4 rounded flex justify-between items-center">
            <div>
              <p className="font-semibold">{t.nom}</p>
              <p className="text-sm text-gray-500">
                Tour {t.tour} · {new Date(t.date).toLocaleDateString()}
              </p>
            </div>

            <div className="flex gap-3">
              <Link href={`/admin/tournaments/${t.id}/edit`} className="text-blue-600">
                Modifier
              </Link>
              <Link href={`/admin/tournaments/${t.id}`} className="text-blue-600">
                Gérer
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
