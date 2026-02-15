import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Le Trophée",
  description:
    "Découvrez l'histoire du Trophée, du vignoble à François Grieder, et un texte hommage dédié à son héritage.",
};

export default function TropheePage() {
  return (
    <main className="min-h-screen bg-card px-6 py-16 text-foreground">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10">
        <header className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Le Trophée
          </p>
          <h1 className="text-4xl font-semibold leading-tight">
            Une distinction façonnée par la terre et la transmission
          </h1>
          <p className="text-lg text-muted-foreground">
            Page purement statique pensée pour célébrer une histoire humaine et
            transmettre un héritage.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">
            Historique (Vignoble → François Grieder)
          </h2>
          <p className="text-base leading-7 text-muted-foreground">
            Le Trophée est né dans les rangs du vignoble, porté par la patience
            des saisons et le geste répété des vendanges. À chaque étape, il a
            suivi la main de ceux qui ont façonné la vigne, jusqu&apos;à François
            Grieder. Héritier d&apos;un savoir-faire collectif, il a su faire évoluer
            l&apos;esprit du domaine sans jamais renier ses racines.
          </p>
          <p className="text-base leading-7 text-muted-foreground">
            Cette trajectoire raconte une transmission authentique&nbsp;: des terroirs
            fondateurs à une vision contemporaine, le Trophée demeure le symbole
            d&apos;un engagement durable et d&apos;une passion partagée.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Texte hommage</h2>
          <p className="text-base leading-7 text-muted-foreground">
            À François Grieder, nous adressons cet hommage sincère. Par son
            exigence et son regard, il a su révéler l&apos;âme du vignoble, mettre en
            lumière la beauté du travail collectif et préserver la mémoire des
            générations qui l&apos;ont précédé.
          </p>
          <p className="text-base leading-7 text-muted-foreground">
            Que ce Trophée demeure le témoin d&apos;un parcours exemplaire, d&apos;une
            fidélité au terroir et d&apos;une ambition partagée&nbsp;: transmettre la
            passion du vin et la force du lien humain.
          </p>
        </section>
      </div>
    </main>
  );
}
