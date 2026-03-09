import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function TournamentsPage() {
  const tournaments = await prisma.tournament.findMany({
    orderBy: { tour: "desc" },
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
              <p className="text-sm text-gray-500">{new Date(t.date).toLocaleDateString()}</p>
            </div>

            <div className="flex gap-3">
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
