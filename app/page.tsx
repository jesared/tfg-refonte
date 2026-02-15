export default function Home() {
  const facebookPageUrl = "https://www.facebook.com/tropheefrancoisgrieder";
  const shareUrl = "https://trophee-francois-grieder.fr";
  const facebookFeedUrl = `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(
    facebookPageUrl,
  )}&tabs=timeline&width=500&height=620&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true`;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 sm:gap-10">
      <section className="rounded-3xl border border-border bg-card px-5 py-7 shadow-sm sm:px-8 sm:py-10">
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:text-sm">
          <span className="text-lg">🏠</span>
          <span>Accueil</span>
        </div>

        <div className="mt-4 space-y-4">
          <h1 className="text-2xl font-semibold text-primary sm:text-4xl">
            Bienvenue sur le Trophée François Grieder
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-foreground/90 sm:text-lg">
            Le trophée <span className="font-semibold text-primary">François Grieder</span> est
            un challenge basé sur un classement général des joueuses et joueurs participant aux
            différents tournois régionaux homologués de la Marne, avec une ouverture récente aux
            Ardennes.
          </p>
          <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Cette nouvelle version met l&apos;accent sur la lisibilité et une expérience cohérente en
            mode clair comme en mode sombre, avec une palette Catppuccin harmonisée sur tout le
            site.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            href="/tableaux"
          >
            Voir tournois
          </a>
          <a
            className="inline-flex items-center justify-center rounded-full border border-border bg-secondary px-6 py-2 text-sm font-semibold text-secondary-foreground shadow-sm transition hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            href="/classements"
          >
            Classements
          </a>
        </div>
      </section>

      <section className="grid gap-6 rounded-3xl border border-border bg-card px-5 py-7 shadow-sm sm:px-8 sm:py-10 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground sm:text-xl">Actualités Facebook</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Les dernières publications de la page officielle sont intégrées directement sur le site
            pour centraliser les annonces (tournois, résultats, photos) sans ressaisie.
          </p>
          <ul className="space-y-2 text-sm text-foreground/90">
            <li>• Les mises à jour apparaissent automatiquement dès publication sur Facebook.</li>
            <li>• Les visiteurs peuvent ouvrir la publication d&apos;origine en un clic.</li>
            <li>• En cas de blocage des cookies, un lien direct reste disponible.</li>
          </ul>
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href={facebookPageUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#1877F2] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              Ouvrir la page Facebook
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-xs font-semibold text-secondary-foreground shadow-sm transition hover:bg-muted"
            >
              Partager le site
            </a>
          </div>
        </div>

        <div className="min-h-[620px] overflow-hidden rounded-2xl border border-border bg-muted/40">
          <iframe
            title="Fil d'actualités Facebook"
            src={facebookFeedUrl}
            width="100%"
            height="620"
            style={{ border: "none", overflow: "hidden" }}
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          />
        </div>
      </section>
    </main>
  );
}
