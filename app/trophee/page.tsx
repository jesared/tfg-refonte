import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Le Trophée",
  description:
    "Origine, vision et valeurs du Trophée François Grieder, inspirées de la présentation officielle.",
};

export default function TropheePage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 sm:gap-10">
      <section className="rounded-3xl border border-border bg-card px-5 py-7 shadow-sm sm:px-8 sm:py-10">
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:text-sm">
          <span className="text-lg">🏆</span>
          <span>Le Trophée</span>
        </div>

        <div className="mt-4 space-y-4">
          <h1 className="text-2xl font-semibold text-primary sm:text-4xl">
            Une aventure sportive née d&apos;une passion locale
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-foreground/90 sm:text-lg">
            Le Trophée François Grieder est avant tout une histoire de terrain, de clubs engagés et
            de bénévoles qui font vivre le tennis de table au quotidien. Son ambition est claire :
            valoriser les performances sur l&apos;ensemble de la saison, dans un esprit de régularité,
            de progression et de respect.
          </p>
          <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Inspiré de la présentation officielle du Trophée, ce parcours met à l&apos;honneur une
            dynamique collective où chaque tournoi compte, où chaque point a du sens et où chaque
            joueuse et joueur peut construire sa saison pas à pas.
          </p>
        </div>
      </section>

      <section className="grid gap-6 rounded-3xl border border-border bg-card px-5 py-7 shadow-sm sm:px-8 sm:py-10 lg:grid-cols-2">
        <article className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground sm:text-2xl">Origine du projet</h2>
          <p className="text-base leading-relaxed text-foreground/90">
            Pensé pour fédérer les tournois régionaux autour d&apos;un classement lisible, le Trophée
            récompense la constance autant que la performance du jour. Il crée un fil rouge entre les
            compétitions et donne de la visibilité à l&apos;engagement de tous les participants.
          </p>
          <p className="text-base leading-relaxed text-foreground/90">
            D&apos;édition en édition, l&apos;initiative s&apos;est structurée grâce à la mobilisation des
            organisateurs, des arbitres, des clubs accueillants et des partenaires qui partagent une
            même volonté : faire grandir la pratique dans un cadre convivial et exigeant.
          </p>
        </article>

        <article className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground sm:text-2xl">L&apos;esprit François Grieder</h2>
          <p className="text-base leading-relaxed text-foreground/90">
            Donner son nom au Trophée, c&apos;est rappeler des valeurs fortes : transmission,
            bienveillance, goût de l&apos;effort et sens du collectif. Cette identité continue d&apos;inspirer
            le challenge, des premières rencontres jusqu&apos;à la remise finale des récompenses.
          </p>
          <p className="text-base leading-relaxed text-foreground/90">
            Au-delà des classements, le Trophée veut célébrer des parcours humains : des jeunes qui
            émergent, des passionnés fidèles, des clubs qui innovent et une communauté qui avance
            ensemble autour d&apos;une même passion sportive.
          </p>
        </article>
      </section>
    </main>
  );
}
