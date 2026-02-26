import { Home as HomeIcon } from "lucide-react";

export default function Home() {
  const facebookPageUrl = "https://www.facebook.com/tropheefrancoisgrieder";
  const actualitesPageUrl = "/actualites";
  const shareUrl = "https://trophee-francois-grieder.fr";
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 sm:gap-10">
      <section className="rounded-3xl border border-border bg-card px-5 py-7 shadow-sm sm:px-8 sm:py-10">
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:text-sm">
          <HomeIcon className="h-5 w-5" aria-hidden="true" />
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

      <section className="rounded-3xl border border-border bg-card px-5 py-7 shadow-sm sm:px-8 sm:py-10">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground sm:text-xl">Actualités Facebook</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Retrouvez les dernières publications et annonces via nos canaux officiels, avec un
            accès direct aux actus du site et à la page Facebook.
          </p>
          <ul className="space-y-2 text-sm text-foreground/90">
            <li>• Consultez les publications triées sur la page Actus.</li>
            <li>• Accédez à la page Facebook officielle en un clic.</li>
            <li>• Partagez facilement le site avec votre entourage.</li>
          </ul>
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href={actualitesPageUrl}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-xs font-semibold text-secondary-foreground shadow-sm transition hover:bg-muted"
            >
              Voir la page Actus
            </a>
            <a
              href={facebookPageUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#1877F2] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              Suivre sur Facebook
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

      </section>
    </main>
  );
}
