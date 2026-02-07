export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-10">
      <section className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white px-6 py-8 shadow-sm">
        <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          <span className="text-lg">🏠</span>
          <span>Accueil</span>
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
            Présentation courte du trophée
          </h1>
          <p className="max-w-2xl text-base text-slate-600 sm:text-lg">
            Le Trophée François Grieder réunit les clubs de la région autour d'un
            challenge convivial, rythmé par des rencontres sportives et une
            ambiance associative.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            href="#"
          >
            Voir tournois
          </a>
          <a
            className="inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
            href="/classements"
          >
            Classements
          </a>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-8">
          <h2 className="text-xl font-semibold text-slate-900">
            Mise en avant saison en cours
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Suivez la progression des équipes, découvrez les prochaines dates et
            consultez les résultats les plus récents de la saison en cours.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Journée clé
              </p>
              <p className="mt-2 font-semibold text-slate-900">
                12 avril - Tour régional
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Score à suivre
              </p>
              <p className="mt-2 font-semibold text-slate-900">
                Classement provisoire mis à jour
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-8 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">
            En résumé
          </h3>
          <ul className="mt-4 space-y-4 text-sm text-slate-600">
            <li className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              Tournois qualificatifs ouverts jusqu'à fin mars.
            </li>
            <li className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              Classements mis à jour après chaque rencontre.
            </li>
            <li className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              Focus sur la finale régionale de mai.
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
