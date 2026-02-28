import { getTableaux } from "@/lib/tableaux";

export default async function TableauxPage() {
  const tableaux = await getTableaux();
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <section className="flex flex-col gap-4 rounded-3xl border border-border bg-card px-5 py-6 shadow-sm sm:px-6 sm:py-8">
        <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <span className="text-lg">📋</span>
          <span>Tableaux &amp; règlement</span>
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
            Tableaux de compétition
          </h1>
          <p className="text-base text-muted-foreground sm:text-lg">
            Retrouvez les 8 tableaux, leurs plages de points et les horaires de début.
            L&apos;affichage est pensé pour être lisible sur mobile avant tout.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Liste des tableaux</h2>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
            {tableaux.length} tableaux
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {tableaux.map((tableau) => (
            <article
              key={tableau.id}
              className="rounded-2xl border border-border bg-card px-4 py-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">{tableau.title}</h3>
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  {tableau.start}
                </span>
              </div>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                    Plage de points
                  </dt>
                  <dd className="mt-1 font-medium text-foreground">{tableau.points}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                    Heure de début
                  </dt>
                  <dd className="mt-1 font-medium text-foreground">{tableau.start}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-border bg-muted/40 px-5 py-6 sm:px-6 sm:py-7">
          <h2 className="text-lg font-semibold text-foreground">Exceptions de programmation</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Certaines plages sont adaptées pour fluidifier la journée.
          </p>
          <ul className="mt-4 space-y-3 text-sm text-foreground/90">
            <li className="rounded-2xl border border-border bg-card px-4 py-3">
              <span className="font-semibold text-foreground">Tableaux 5–6</span>
              <p className="mt-1 text-sm text-muted-foreground">
                Démarrage décalé après la pause méridienne pour libérer les tables du matin.
              </p>
            </li>
            <li className="rounded-2xl border border-border bg-card px-4 py-3">
              <span className="font-semibold text-foreground">Tableaux 15–22</span>
              <p className="mt-1 text-sm text-muted-foreground">
                Programmés en toute fin de journée avec confirmation des horaires sur place.
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
                Poules de 3 ou 4 joueurs selon les inscriptions.
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
                Les deux premiers de chaque poule accèdent au tableau final.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
