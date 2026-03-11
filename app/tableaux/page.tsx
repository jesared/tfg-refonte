import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TableauxPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ nom: "asc" }, { heureDebut: "asc" }],
    include: {
      tournament: {
        select: { tour: true },
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
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <section className="flex flex-col gap-4 rounded-3xl border border-border bg-card px-5 py-6 shadow-sm sm:px-6 sm:py-8">
        <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <span className="text-lg">📋</span>
          <span>Tableaux &amp; règlement</span>
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
            Catégories de compétition
          </h1>
          <p className="text-base text-muted-foreground sm:text-lg">
            Retrouvez les catégories, leurs plages de points et les horaires de début.
            L&apos;affichage est pensé pour être lisible sur mobile avant tout.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Liste des catégories</h2>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
            {groupedCategories.length} catégories
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {groupedCategories.map((group) => {
            const sample = group[0];
            const points = `${sample.minPoints ?? "-∞"} → ${sample.maxPoints ?? "+∞"}`;
            const start = new Date(sample.heureDebut).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <article
                key={sample.nom}
                className="rounded-2xl border border-border bg-card px-4 py-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold text-foreground">{sample.nom}</h3>
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    {start}
                  </span>
                </div>
                <dl className="mt-4 space-y-3 text-sm">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                      Plage de points
                    </dt>
                    <dd className="mt-1 font-medium text-foreground">{points}</dd>
                  </div>
                </dl>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-border bg-muted/40 px-5 py-6 sm:px-6 sm:py-7">
          <h2 className="text-lg font-semibold text-foreground">Format selon les tableaux</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Le format des poules et la qualification varient selon les catégories.
          </p>
          <ul className="mt-4 space-y-3 text-sm text-foreground/90">
            <li className="rounded-2xl border border-border bg-card px-4 py-3">
              <span className="font-semibold text-foreground">Tableaux 5–6</span>
              <p className="mt-1 text-sm text-muted-foreground">
                Poules de 3 joueurs, avec qualification pour tous les participants.
              </p>
            </li>
            <li className="rounded-2xl border border-border bg-card px-4 py-3">
              <span className="font-semibold text-foreground">Tableaux 15–22</span>
              <p className="mt-1 text-sm text-muted-foreground">
                Poules de 4 joueurs, les 3 premiers de chaque poule sont qualifiés.
              </p>
            </li>
            <li className="rounded-2xl border border-border bg-card px-4 py-3">
              <span className="font-semibold text-foreground">Autres tableaux</span>
              <p className="mt-1 text-sm text-muted-foreground">
                Poules de 3 joueurs, les 2 premiers de chaque poule sont qualifiés.
              </p>
            </li>
          </ul>
        </div>

        <div className="rounded-3xl border border-border bg-card px-5 py-6 shadow-sm sm:px-6 sm:py-7">
          <h2 className="text-lg font-semibold text-foreground">Format des poules</h2>
          <div className="mt-4 space-y-4 text-sm text-muted-foreground">
            <div className="rounded-2xl border border-border bg-muted/40 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Composition</p>
              <p className="mt-2 font-medium text-foreground">
                Le nombre de joueurs peut être ajusté selon les inscrits (poules de 2 au lieu de 3,
                ou de 3 au lieu de 4).
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-muted/40 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Matchs</p>
              <p className="mt-2 font-medium text-foreground">
                Rencontres en 3 manches gagnantes, arbitrage tournant.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-muted/40 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Qualification</p>
              <p className="mt-2 font-medium text-foreground">
                Qualification selon le tableau : tous qualifiés en 5–6, 3 qualifiés sur 4 en 15–22,
                sinon 2 qualifiés sur 3.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
