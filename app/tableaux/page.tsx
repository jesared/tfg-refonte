const tableaux = [
  {
    id: 1,
    title: "Tableau 1",
    points: "2000 à 1600 pts",
    start: "08h30",
  },
  {
    id: 2,
    title: "Tableau 2",
    points: "1599 à 1300 pts",
    start: "09h15",
  },
  {
    id: 3,
    title: "Tableau 3",
    points: "1299 à 1000 pts",
    start: "10h00",
  },
  {
    id: 4,
    title: "Tableau 4",
    points: "999 à 800 pts",
    start: "10h45",
  },
  {
    id: 5,
    title: "Tableau 5",
    points: "799 à 600 pts",
    start: "11h30",
  },
  {
    id: 6,
    title: "Tableau 6",
    points: "599 à 500 pts",
    start: "13h30",
  },
  {
    id: 7,
    title: "Tableau 7",
    points: "499 à 300 pts",
    start: "14h15",
  },
  {
    id: 8,
    title: "Tableau 8",
    points: "299 pts et moins",
    start: "15h00",
  },
];

export default function TableauxPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <section className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white px-5 py-6 shadow-sm sm:px-6 sm:py-8">
        <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          <span className="text-lg">📋</span>
          <span>Tableaux &amp; règlement</span>
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
            Tableaux de compétition
          </h1>
          <p className="text-base text-slate-600 sm:text-lg">
            Retrouvez les 8 tableaux, leurs plages de points et les horaires de
            début. L&apos;affichage est pensé pour être lisible sur mobile avant tout.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">
            Liste des tableaux
          </h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            8 tableaux
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {tableaux.map((tableau) => (
            <article
              key={tableau.id}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  {tableau.title}
                </h3>
                <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                  {tableau.start}
                </span>
              </div>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">
                    Plage de points
                  </dt>
                  <dd className="mt-1 font-medium text-slate-900">
                    {tableau.points}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">
                    Heure de début
                  </dt>
                  <dd className="mt-1 font-medium text-slate-900">
                    {tableau.start}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-6 sm:px-6 sm:py-7">
          <h2 className="text-lg font-semibold text-slate-900">
            Exceptions de programmation
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Certaines plages sont adaptées pour fluidifier la journée.
          </p>
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            <li className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <span className="font-semibold text-slate-900">
                Tableaux 5–6
              </span>
              <p className="mt-1 text-sm text-slate-600">
                Démarrage décalé après la pause méridienne pour libérer les
                tables du matin.
              </p>
            </li>
            <li className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <span className="font-semibold text-slate-900">
                Tableaux 15–22
              </span>
              <p className="mt-1 text-sm text-slate-600">
                Programmés en toute fin de journée avec confirmation des horaires
                sur place.
              </p>
            </li>
          </ul>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white px-5 py-6 shadow-sm sm:px-6 sm:py-7">
          <h2 className="text-lg font-semibold text-slate-900">
            Format des poules
          </h2>
          <div className="mt-4 space-y-4 text-sm text-slate-600">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Composition
              </p>
              <p className="mt-2 font-medium text-slate-900">
                Poules de 3 ou 4 joueurs selon les inscriptions.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Matchs
              </p>
              <p className="mt-2 font-medium text-slate-900">
                Rencontres en 3 manches gagnantes, arbitrage tournant.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Qualification
              </p>
              <p className="mt-2 font-medium text-slate-900">
                Les deux premiers de chaque poule accèdent au tableau final.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
