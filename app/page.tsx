const quickLinks = [
  {
    title: "Tableaux & règlement",
    description: "Consultez les tableaux, horaires et exceptions de programmation.",
    href: "/tableaux",
    cta: "Voir les tableaux",
  },
  {
    title: "Classements",
    description: "Accédez aux classements officiels et aux documents de chaque tour.",
    href: "/classements",
    cta: "Consulter les classements",
  },
  {
    title: "Récompenses",
    description: "Découvrez la répartition des lots et la cérémonie de remise.",
    href: "/recompenses",
    cta: "Découvrir les récompenses",
  },
];

export default function Home() {
  const facebookPageUrl = "https://www.facebook.com/tropheefrancoisgrieder";
  const shareUrl = "https://trophee-francois-grieder.fr";
  const facebookFeedUrl = `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(
    facebookPageUrl,
  )}&tabs=timeline&width=500&height=620&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true`;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 sm:gap-10">
      <section className="flex flex-col gap-6 rounded-3xl border border-border bg-card px-5 py-7 shadow-sm sm:px-8 sm:py-10">
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:text-sm">
          <span className="text-lg">🏠</span>
          <span>Accueil</span>
        </div>
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold text-primary sm:text-4xl">
            Trophée François Grieder
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Le Trophée François Grieder rassemble les joueurs autour d&apos;un classement général
            construit à partir des tournois régionaux homologués. Cette plateforme centralise les
            informations essentielles de la saison: tableaux, classements et récompenses.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            href="/tableaux"
          >
            Voir les tournois
          </a>
          <a
            className="inline-flex items-center justify-center rounded-full border border-primary/40 bg-card px-6 py-2 text-sm font-semibold text-primary shadow-sm transition hover:border-accent hover:bg-accent hover:text-accent-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            href="/classements"
          >
            Classements
          </a>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {quickLinks.map((link) => (
          <article key={link.title} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">{link.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{link.description}</p>
            <a
              href={link.href}
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-accent"
            >
              {link.cta}
              <span aria-hidden="true">↗</span>
            </a>
          </article>
        ))}
      </section>

      <section className="grid gap-6 rounded-3xl border border-border bg-card px-5 py-7 shadow-sm sm:px-8 sm:py-10 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground sm:text-xl">Actualités Facebook</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Les dernières publications de la page officielle sont intégrées directement sur le site.
            Cela permet de centraliser les annonces (tournois, résultats, photos) sans ressaisie.
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
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
              className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/30 px-4 py-2 text-xs font-semibold text-muted-foreground shadow-sm transition hover:border-border hover:text-foreground"
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
