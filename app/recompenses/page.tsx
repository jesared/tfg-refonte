import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Récompenses",
  description:
    "Présentation des récompenses, des mises de fond par club et de la cérémonie de remise du trophée.",
};

export default function RecompensesPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-16 text-zinc-900">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-12">
        <header className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Récompenses
          </p>
          <h1 className="text-4xl font-semibold leading-tight">
            Valoriser l&apos;engagement des clubs et célébrer la performance
          </h1>
          <p className="text-lg text-zinc-600">
            Une page dédiée à l&apos;effort collectif, aux lots remis aux équipes
            gagnantes et à la cérémonie finale du trophée.
          </p>
        </header>

        <section className="grid gap-6 rounded-3xl border border-zinc-200 bg-zinc-50 p-8 shadow-sm">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold">Mise de fond par club</h2>
            <p className="text-base leading-7 text-zinc-700">
              Chaque club participant contribue à hauteur de 100&nbsp;€, une mise
              de fond unique destinée à constituer une enveloppe commune pour les
              récompenses. Cette contribution garantit un engagement équitable et
              renforce l&apos;esprit d&apos;entraide entre les équipes.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-zinc-200 bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Contribution
              </p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900">100&nbsp;€</p>
              <p className="mt-2 text-sm text-zinc-600">
                Par club engagé dans la saison.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Objectif
              </p>
              <p className="mt-2 text-base font-semibold text-zinc-900">
                Récompenser l&apos;effort collectif
              </p>
              <p className="mt-2 text-sm text-zinc-600">
                L&apos;enveloppe permet de doter les trois premières équipes.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Détail des lots</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                1er
              </p>
              <h3 className="mt-3 text-xl font-semibold">Trophée principal</h3>
              <p className="mt-3 text-sm text-zinc-600">
                Remise du trophée François Grieder, dotation financière majeure
                et mise en avant officielle du club vainqueur.
              </p>
            </article>
            <article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                2e
              </p>
              <h3 className="mt-3 text-xl font-semibold">Dotation d&apos;équipe</h3>
              <p className="mt-3 text-sm text-zinc-600">
                Lot financier et équipement sportif pour valoriser la progression
                jusqu&apos;à la finale.
              </p>
            </article>
            <article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                3e
              </p>
              <h3 className="mt-3 text-xl font-semibold">Prix de podium</h3>
              <p className="mt-3 text-sm text-zinc-600">
                Récompense symbolique, dotée par les partenaires locaux, pour
                saluer une saison régulière et solide.
              </p>
            </article>
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-zinc-50 p-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">
              Cérémonie de remise des récompenses
            </h2>
            <p className="text-base leading-7 text-zinc-700">
              La remise officielle se déroule lors de la soirée de clôture. Les
              capitaines et représentants des clubs sont invités à recevoir les
              lots, à partager un temps d&apos;échanges avec les bénévoles et à
              célébrer les performances de la saison.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  Moment clé
                </p>
                <p className="mt-2 text-sm font-semibold text-zinc-900">
                  Soirée finale &amp; hommage aux clubs
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  Participants
                </p>
                <p className="mt-2 text-sm font-semibold text-zinc-900">
                  Clubs, partenaires, bénévoles et supporters
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
