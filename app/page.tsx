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

      <section className="rounded-3xl border border-slate-200 bg-white px-5 py-7 shadow-sm sm:px-8 sm:py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Intégration sociale
            </p>
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
              Facebook au cœur de la vie du trophée
            </h2>
          </div>
          <a
            className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
            href={facebookPageUrl}
            rel="noreferrer"
            target="_blank"
          >
            Suivre la page Facebook
          </a>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">
                Fil d&apos;actualités
              </h3>
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Facebook feed
              </span>
            </div>
            <iframe
              className="h-[420px] w-full rounded-xl border border-slate-200 bg-white"
              src={`https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(
                facebookPageUrl,
              )}&tabs=timeline&width=340&height=420&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=true&appId=`}
              title="Fil Facebook Trophée François Grieder"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              loading="lazy"
            />
            <p className="text-sm text-slate-600">
              Consultez les derniers résultats, annonces et moments forts
              partagés par les clubs.
            </p>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">
                Boutons de partage
              </h3>
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Social share
              </span>
            </div>
            <div className="space-y-3">
              <a
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  shareUrl,
                )}`}
                rel="noreferrer"
                target="_blank"
              >
                Partager la page du trophée
                <span aria-hidden>↗</span>
              </a>
              <a
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  `${shareUrl}/classements`,
                )}`}
                rel="noreferrer"
                target="_blank"
              >
                Partager les classements
                <span aria-hidden>↗</span>
              </a>
              <a
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                href={facebookPageUrl}
                rel="noreferrer"
                target="_blank"
              >
                Inviter un club à suivre la page
                <span aria-hidden>↗</span>
              </a>
            </div>
            <p className="text-sm text-slate-600">
              Encouragez les clubs à relayer les infos et à partager les
              résultats en un clic.
            </p>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">
                Photos du jour
              </h3>
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Temps forts
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                "Arrivée des équipes",
                "Ambiance du club-house",
                "Moments décisifs",
                "Remise des prix",
              ].map((label, index) => (
                <div
                  key={label}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                >
                  <div
                    className={`flex aspect-[4/3] items-end justify-between bg-gradient-to-br ${
                      index % 2 === 0
                        ? "from-slate-900 via-slate-700 to-slate-500"
                        : "from-amber-500 via-orange-400 to-rose-400"
                    } p-3 text-xs font-semibold text-white`}
                  >
                    {label}
                    <span className="rounded-full bg-white/20 px-2 py-1 text-[10px] uppercase">
                      Aujourd&apos;hui
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-600">
              Les plus belles photos remontées par les clubs pour revivre la
              journée.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
