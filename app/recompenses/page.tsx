import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Récompenses",
  description:
    "Présentation des récompenses, des mises de fond par club et de la cérémonie de remise du trophée.",
};

export default function RecompensesPage() {
  return (
    <main className="min-h-screen bg-card px-6 py-16 text-foreground">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-12">
        <header className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Récompenses
          </p>
          <h1 className="text-4xl font-semibold leading-tight">
            Valoriser l&apos;engagement des clubs et célébrer la performance
          </h1>
          <p className="text-lg text-muted-foreground">
            Une page dédiée à l&apos;effort collectif, aux lots remis aux équipes
            gagnantes et à la cérémonie finale du trophée.
          </p>
        </header>

        <section className="grid gap-6 rounded-3xl border border-border bg-muted/40 p-8 shadow-sm">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold">Mise de fond par club</h2>
            <p className="text-base leading-7 text-foreground/90">
              Chaque club participant contribue à hauteur de 100&nbsp;€, une mise
              de fond unique destinée à constituer une enveloppe commune pour les
              récompenses. Cette contribution garantit un engagement équitable,
              renforce l&apos;esprit d&apos;entraide entre les équipes et assure
              une redistribution transparente lors de la cérémonie finale.
            </p>
            <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card/80 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Répartition
                </p>
                <p className="mt-2">
                  60% pour le 1er, 25% pour le 2e et 15% pour le 3e, afin de
                  valoriser chaque podium.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card/80 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Transparence
                </p>
                <p className="mt-2">
                  Les clubs reçoivent un récapitulatif des contributions et des
                  dotations lors de la remise officielle.
                </p>
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Contribution
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">100&nbsp;€</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Par club engagé dans la saison.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Objectif
              </p>
              <p className="mt-2 text-base font-semibold text-foreground">
                Récompenser l&apos;effort collectif
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                L&apos;enveloppe permet de doter les trois premières équipes.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Détail des lots</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <article className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                1er
              </p>
              <h3 className="mt-3 text-xl font-semibold">Trophée principal</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Remise du trophée François Grieder, dotation financière majeure
                (60% de l&apos;enveloppe) et mise en avant officielle du club
                vainqueur sur les supports de la ligue.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>• Trophée gravé + médaille</li>
                <li>• Mise à l&apos;honneur lors de la soirée finale</li>
              </ul>
            </article>
            <article className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                2e
              </p>
              <h3 className="mt-3 text-xl font-semibold">Dotation d&apos;équipe</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Lot financier (25% de l&apos;enveloppe) et équipement sportif pour
                valoriser la progression jusqu&apos;à la finale.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>• Pack textile pour l&apos;effectif</li>
                <li>• Bon d&apos;achat chez un partenaire local</li>
              </ul>
            </article>
            <article className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                3e
              </p>
              <h3 className="mt-3 text-xl font-semibold">Prix de podium</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Récompense symbolique (15% de l&apos;enveloppe), dotée par les
                partenaires locaux, pour saluer une saison régulière et solide.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>• Trophée podium + kit supporters</li>
                <li>• Mise en avant dans la newsletter</li>
              </ul>
            </article>
          </div>
        </section>

        <section className="grid gap-8 rounded-3xl border border-border bg-card p-8 shadow-sm lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Photo des trophées</h2>
            <p className="text-base leading-7 text-foreground/90">
              Les trophées sont présentés comme un symbole d&apos;excellence et
              d&apos;esprit sportif. Ils sont dévoilés lors du lancement de la
              saison afin de motiver chaque équipe à viser le podium.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-muted/40 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Matériaux
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Métal brossé, bois verni, finitions artisanales locales.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/40 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Gravure
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Nom du club vainqueur et édition de la saison.
                </p>
              </div>
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl border border-border bg-muted/40">
            <img
              src="https://images.unsplash.com/photo-1506459225024-1428097a7e18?auto=format&fit=crop&w=900&q=80"
              alt="Trophées dorés exposés sur une table en bois."
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-2xl font-semibold">Carrousel des moments forts</h2>
            <p className="max-w-xl text-sm text-muted-foreground">
              Une boucle animée met en avant les trophées, les dotations et la
              célébration finale. Faites défiler pour découvrir chaque étape.
            </p>
          </div>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-muted/40">
            <div className="flex w-[200%] animate-[trophy-scroll_24s_linear_infinite] gap-6 p-6">
              {[
                {
                  title: "Trophée principal",
                  desc: "Moment phare avec remise officielle du trophée.",
                },
                {
                  title: "Dotation 2e place",
                  desc: "Équipement sportif pour renforcer l&apos;effectif.",
                },
                {
                  title: "Prix podium",
                  desc: "Récompense symbolique et visibilité locale.",
                },
                {
                  title: "Célébration finale",
                  desc: "Discours, photos et mise à l&apos;honneur des clubs.",
                },
              ].map((item) => (
                <article
                  key={item.title}
                  className="min-w-[240px] flex-1 rounded-2xl border border-border bg-card p-5 shadow-sm"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Highlight
                  </p>
                  <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                </article>
              ))}
              {[
                {
                  title: "Trophée principal",
                  desc: "Moment phare avec remise officielle du trophée.",
                },
                {
                  title: "Dotation 2e place",
                  desc: "Équipement sportif pour renforcer l&apos;effectif.",
                },
                {
                  title: "Prix podium",
                  desc: "Récompense symbolique et visibilité locale.",
                },
                {
                  title: "Célébration finale",
                  desc: "Discours, photos et mise à l&apos;honneur des clubs.",
                },
              ].map((item) => (
                <article
                  key={`${item.title}-duplicate`}
                  className="min-w-[240px] flex-1 rounded-2xl border border-border bg-card p-5 shadow-sm"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Highlight
                  </p>
                  <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-muted/40 p-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">
              Cérémonie de remise des récompenses
            </h2>
            <p className="text-base leading-7 text-foreground/90">
              La remise officielle se déroule lors de la soirée de clôture. Les
              capitaines et représentants des clubs sont invités à recevoir les
              lots, à partager un temps d&apos;échanges avec les bénévoles et à
              célébrer les performances de la saison.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Moment clé
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  Soirée finale &amp; hommage aux clubs
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Participants
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
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
