const recentResults = [
  {
    title: "Journée 3 · Tour régional",
    summary: "Synchronisé depuis PDF",
    updated: "Mis à jour il y a 2 heures",
    href: "/documents/resultats-journee-3.pdf",
    format: "PDF",
  },
  {
    title: "Journée 3 · Détail des rencontres",
    summary: "Synchronisé depuis CSV",
    updated: "Mis à jour il y a 2 heures",
    href: "/documents/resultats-journee-3.csv",
    format: "CSV",
  },
];

const liveStandings = [
  {
    team: "USC Grenoble",
    points: 38,
    trend: "+2",
  },
  {
    team: "ASL Voiron",
    points: 35,
    trend: "+1",
  },
  {
    team: "OGC Meylan",
    points: 33,
    trend: "=",
  },
  {
    team: "SCN Chartreuse",
    points: 30,
    trend: "-1",
  },
];

const rankingDownloads = [
  {
    title: "Tournoi d'automne",
    date: "12 octobre 2024",
    href: "/documents/classement-tournoi-automne.pdf",
    description: "Classement provisoire et répartition des points.",
  },
  {
    title: "Tournoi d'hiver",
    date: "18 janvier 2025",
    href: "/documents/classement-tournoi-hiver.pdf",
    description: "Résultats intermédiaires et statistiques clés.",
  },
];

export default function Home() {
  const facebookPageUrl = "https://www.facebook.com/tropheefgrieder";
  const shareUrl = "https://trophee-francois-grieder.fr";

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
            Le Trophée François Grieder réunit les clubs de la région autour d'un
            challenge convivial, rythmé par des rencontres sportives et une
            ambiance associative.
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
            Suivez la progression des équipes, découvrez les prochaines dates et
            consultez les résultats les plus récents de la saison en cours.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-slate-600">
                Journée clé
              </p>
              <p className="mt-2 font-semibold text-slate-900">
                12 avril - Tour régional
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-slate-600">
                Score à suivre
              </p>
              <p className="mt-2 font-semibold text-slate-900">
                Classement provisoire mis à jour
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white px-5 py-7 shadow-sm sm:px-8 sm:py-10">
          <h3 className="text-lg font-semibold text-slate-900">
            En résumé
          </h3>
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

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white px-5 py-7 shadow-sm sm:px-8 sm:py-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
              Résultats récents (auto)
            </h2>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Synchronisé
            </span>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Liste actualisée automatiquement à partir des PDF et CSV déposés
            par les organisateurs.
          </p>
          <ul className="mt-6 space-y-4">
            {recentResults.map((result) => (
              <li
                key={result.title}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {result.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    {result.summary} · {result.updated}
                  </p>
                </div>
                <a
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
                  href={result.href}
                >
                  {result.format}
                  <span aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-7 sm:px-8 sm:py-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
              Classement provisoire live
            </h2>
            <span className="flex items-center gap-2 text-xs font-semibold text-rose-600">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              En direct
            </span>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Données actualisées toutes les 30 minutes pour refléter les derniers
            scores saisis.
          </p>
          <div className="mt-6 space-y-3">
            {liveStandings.map((entry, index) => (
              <div
                key={entry.team}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-500">
                      #{index + 1}
                    </span>
                    <p className="text-sm font-semibold text-slate-900">
                      {entry.team}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                    <span>{entry.points} pts</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5">
                      {entry.trend}
                    </span>
                  </div>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-slate-900"
                    style={{ width: `${70 + index * 7}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white px-5 py-7 shadow-sm sm:px-8 sm:py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
              Téléchargement des classements par tournoi
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Chaque tournoi dispose de son PDF officiel avec un aperçu intégré
              et un téléchargement direct.
            </p>
          </div>
          <a
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
            href="/documents"
          >
            Voir tous les fichiers
            <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {rankingDownloads.map((ranking) => (
            <article
              key={ranking.title}
              className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4"
            >
              <div className="aspect-[4/3] overflow-hidden rounded-xl border border-slate-200 bg-white">
                <object
                  data={ranking.href}
                  type="application/pdf"
                  className="h-full w-full"
                >
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
                    Aperçu PDF indisponible
                  </div>
                </object>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-900">
                    {ranking.title}
                  </h3>
                  <span className="text-xs text-slate-500">{ranking.date}</span>
                </div>
                <p className="text-sm text-slate-600">{ranking.description}</p>
                <div className="flex flex-wrap gap-3">
                  <a
                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
                    href={ranking.href}
                    download
                  >
                    Télécharger le PDF
                  </a>
                  <a
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
                    href={ranking.href}
                  >
                    Ouvrir l'aperçu
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
