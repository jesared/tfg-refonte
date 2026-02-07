export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 sm:gap-10">
      <section className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white px-5 py-7 shadow-sm sm:px-8 sm:py-10">
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-slate-600 sm:text-sm">
          <span className="text-lg">🏠</span>
          <span>Accueil</span>
        </div>
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold text-slate-900 sm:text-4xl">
            Présentation courte du trophée
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-slate-700 sm:text-lg">
            Le trophée François Grieder est un challenge établi sur la base d’un classement général
            des joueurs participant aux différents tournois régionaux homologués organisés dans le
            département de la Marne et depuis l’année dernière dans le département des Ardennes
            puisque le club de Tagnon organise un tour.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            href="#"
          >
            Voir tournois
          </a>
          <a
            className="inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            href="/classements"
          >
            Classements
          </a>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-7 sm:px-8 sm:py-10">
          <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
            Mise en avant saison en cours
          </h2>
          <p className="mt-3 text-base leading-relaxed text-slate-700">
            Suivez la progression des équipes, découvrez les prochaines dates et consultez les
            résultats les plus récents de la saison en cours.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-slate-600">Journée clé</p>
              <p className="mt-2 font-semibold text-slate-900">12 avril - Tour régional</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-slate-600">Score à suivre</p>
              <p className="mt-2 font-semibold text-slate-900">Classement provisoire mis à jour</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white px-5 py-7 shadow-sm sm:px-8 sm:py-10">
          <h3 className="text-lg font-semibold text-slate-900">En résumé</h3>
          <ul className="mt-4 space-y-4 text-base text-slate-700">
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
