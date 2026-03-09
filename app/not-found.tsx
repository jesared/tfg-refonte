import Link from "next/link";
import { X, Home, Trophy } from "lucide-react";

export default function NotFound() {
  return (
    <section className="mx-auto w-full max-w-3xl rounded-3xl border border-border bg-card px-6 py-10 shadow-sm sm:px-10">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:text-sm">
        <X className="h-4 w-4" aria-hidden="true" />
        <span>Erreur 404</span>
      </div>

      <div className="mt-5 space-y-4">
        <h1 className="text-3xl font-semibold text-primary sm:text-4xl">Page introuvable</h1>
        <p className="text-base leading-relaxed text-foreground/90 sm:text-lg">
          Oups, cette page ne fait pas partie du parcours du Trophée François Grieder. Elle a
          peut-être été déplacée, renommée, ou n&apos;existe plus.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-dashed border-border bg-background/70 p-5">
        <div className="flex items-start gap-3">
          <Trophy className="mt-0.5 h-5 w-5 text-accent" aria-hidden="true" />
          <p className="text-sm text-muted-foreground sm:text-base">
            Vous pouvez revenir à l&apos;accueil pour continuer votre navigation vers les tableaux,
            classements et actualités.
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
        >
          <Home className="h-4 w-4" aria-hidden="true" />
          Retour à l&apos;accueil
        </Link>
        <Link
          href="/tableaux"
          className="inline-flex items-center rounded-full border border-border bg-secondary px-5 py-2 text-sm font-semibold text-secondary-foreground shadow-sm transition hover:bg-muted"
        >
          Voir les tournois
        </Link>
      </div>
    </section>
  );
}
