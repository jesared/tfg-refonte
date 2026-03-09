import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CategoryActions } from "@/app/admin/categories/_components/CategoryActions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export default async function AdminCategoriesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const categories = await prisma.category.findMany({
    orderBy: [{ nom: "asc" }, { tournament: { nom: "asc" } }],
    include: {
      tournament: {
        select: { id: true, nom: true },
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
    <main className="mx-auto w-full max-w-6xl space-y-6 p-8">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Catégories</h1>
          <p className="text-sm text-muted-foreground">Gérez les catégories disponibles.</p>
        </div>
        <Button asChild>
          <Link href="/admin/categories/new">+ Ajouter une catégorie</Link>
        </Button>
      </header>

      {groupedCategories.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Aucune catégorie créée pour le moment.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Liste des catégories</CardTitle>
            <CardDescription>
              Les catégories sont regroupées par nom et mutualisées entre les tours.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Horaires</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Inscriptions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedCategories.map((group) => {
                  const sample = group[0];
                  const totalRegistrations = group.reduce(
                    (sum, item) => sum + item._count.registrations,
                    0,
                  );

                  return (
                    <TableRow key={sample.nom} className="align-top">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">{sample.nom}</div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(sample.heureDebut).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {sample.heureFin
                          ? ` - ${new Date(sample.heureFin).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                          : ""}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {sample.minPoints ?? "-∞"} → {sample.maxPoints ?? "+∞"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{totalRegistrations}</TableCell>
                      <TableCell>
                        <CategoryActions categoryId={sample.id} categoryName={sample.nom} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
