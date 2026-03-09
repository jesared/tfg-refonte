import { CalendarDays, Check, ShieldCheck, Trophy } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CategoryActions } from "@/app/admin/categories/_components/CategoryActions";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

type CategoryWithRelations = Awaited<
  ReturnType<typeof prisma.category.findMany>
>[number] & {
  tournament: { id: string; nom: string };
  _count: { registrations: number };
};

function formatTime(date: Date | null) {
  if (!date) {
    return null;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

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
    categories.reduce<Record<string, CategoryWithRelations[]>>((acc, category) => {
      acc[category.nom] = acc[category.nom] ?? [];
      acc[category.nom].push(category);
      return acc;
    }, {}),
  );

  const totalRegistrations = categories.reduce(
    (sum, category) => sum + category._count.registrations,
    0,
  );

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <header className="rounded-2xl border border-border bg-card px-6 py-7 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Admin</p>
            <h1 className="mt-3 text-3xl font-semibold text-foreground">Catégories</h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Pilotez les catégories utilisées sur les tournois, vérifiez leurs créneaux et suivez les
              inscriptions associées en un coup d&apos;œil.
            </p>
          </div>

          <Link
            href="/admin/categories/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            <Check className="h-4 w-4" aria-hidden="true" />
            Nouvelle catégorie
          </Link>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2 text-primary">
            <Trophy className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="text-sm text-muted-foreground">Catégories distinctes</p>
          <p className="mt-1 text-3xl font-semibold text-foreground">{groupedCategories.length}</p>
        </article>

        <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2 text-primary">
            <CalendarDays className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="text-sm text-muted-foreground">Catégories déployées</p>
          <p className="mt-1 text-3xl font-semibold text-foreground">{categories.length}</p>
        </article>

        <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2 text-primary">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="text-sm text-muted-foreground">Inscriptions enregistrées</p>
          <p className="mt-1 text-3xl font-semibold text-foreground">{totalRegistrations}</p>
        </article>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Liste des catégories
          </h2>
          <p className="text-xs text-muted-foreground">Regroupées par nom, mutualisées entre les tours</p>
        </div>

        {groupedCategories.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
            <p className="text-sm text-muted-foreground">Aucune catégorie n&apos;a encore été créée.</p>
            <Link
              href="/admin/categories/new"
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              Créer la première catégorie
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {groupedCategories.map((group) => {
              const sample = group[0];
              const totalByGroup = group.reduce((sum, item) => sum + item._count.registrations, 0);
              const start = formatTime(sample.heureDebut);
              const end = formatTime(sample.heureFin);

              return (
                <article
                  key={sample.nom}
                  className="flex flex-col gap-4 rounded-xl border border-border/80 bg-muted/20 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{sample.nom}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {start ?? "Horaire non défini"}
                        {end ? ` - ${end}` : ""} · {sample.minPoints ?? "-∞"} → {sample.maxPoints ?? "+∞"} points
                      </p>
                    </div>

                    <CategoryActions categoryId={sample.id} categoryName={sample.nom} />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      {totalByGroup} inscription{totalByGroup > 1 ? "s" : ""}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
