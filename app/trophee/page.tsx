import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Le Trophée",
  description:
    "Présentation officielle du Trophée François Grieder, challenge régional de tennis de table basé sur la régularité et la performance tout au long de la saison.",
};

export default function TropheePage() {
  return (
    <main className="min-h-screen bg-card px-6 py-16 text-foreground">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-12">
        {/* HEADER */}
        <header className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Le Trophée
          </p>

          <h1 className="text-4xl font-semibold leading-tight">Trophée François Grieder</h1>

          <p className="text-lg leading-8 text-foreground/90">
            Le Trophée François Grieder est un challenge régional de tennis de table organisé autour
            des tournois homologués du département de la Marne et des Ardennes.
          </p>

          <p className="text-lg leading-8 text-foreground/90">
            Créé en hommage à François Grieder, fidèle participant du circuit, ce trophée récompense
            la régularité et la performance des joueurs tout au long de la saison.
          </p>
        </header>

        {/* PRINCIPE */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Le principe</h2>

          <p className="text-base leading-7 text-foreground/90">
            Chaque tournoi du circuit propose les mêmes tableaux par catégories de points. Les
            joueurs accumulent des points en fonction de leurs résultats afin d’établir un
            classement général sur l’ensemble de la saison.
          </p>

          <div className="rounded-lg border border-border/60 bg-background/60 p-6 space-y-3">
            <ul className="list-disc space-y-2 pl-6 text-base leading-7 text-foreground/90">
              <li>Des tableaux répartis par niveaux de points</li>
              <li>Un barème identique sur chaque tournoi</li>
              <li>Un classement général par tableau</li>
              <li>Une remise de récompenses en fin de saison</li>
            </ul>
          </div>
        </section>

        {/* FONCTIONNEMENT */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Fonctionnement</h2>

          <p className="text-base leading-7 text-foreground/90">
            Les points sont attribués selon la performance réalisée dans chaque tableau. En cas
            d’égalité au classement général, le départage s’effectue selon plusieurs critères
            successifs :
          </p>

          <ul className="list-disc space-y-2 pl-6 text-base leading-7 text-foreground/90">
            <li>Nombre de tournois disputés</li>
            <li>Nombre de victoires</li>
            <li>Nombre de places de finaliste, puis demi-finaliste, etc.</li>
            <li>Âge du joueur en dernier critère</li>
          </ul>
        </section>

        {/* RECOMPENSES */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Récompenses</h2>

          <p className="text-base leading-7 text-foreground/90">
            Chaque club participant contribue à la dotation du challenge afin de récompenser les
            trois premiers de chaque classement général.
          </p>

          <p className="text-base leading-7 text-foreground/90">
            La cérémonie officielle de remise des récompenses a lieu à l’issue du dernier tournoi de
            la saison.
          </p>
        </section>

        {/* NOTE */}
        <section className="rounded-lg border border-border/60 bg-muted/40 p-6 text-sm leading-6 text-muted-foreground">
          Pour consulter le détail des tableaux, le barème précis des points ou la liste complète
          des récompenses, rendez-vous dans les sections dédiées du site.
        </section>
      </div>
    </main>
  );
}
