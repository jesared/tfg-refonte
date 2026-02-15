import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Le Trophée",
  description:
    "Présentation officielle du Trophée François Grieder, du calendrier des tournois aux règles de classement et récompenses.",
};

const tournoisSaison2024_2025 = [
  "25 août 2024 : GUEUX",
  "08 septembre 2024 : ORTT",
  "27 octobre 2024 : TAGNON",
  "8 décembre 2024 : EPERNAY",
  "22 décembre 2024 : MESNIL",
  "05 janvier 2025 : PTT REIMS",
  "02 mars 2025 : TAISSY",
  "11 février 2025 : PTT CHÂLONS",
];

const tableaux = [
  "5 à 6 (500 à 699 pts) début : 8h30",
  "5 à 8 (500 à 899 pts) début : 10h30",
  "5 à 10 (500 à 1099 pts) début : 12h30",
  "7 à 12 (700 à 1299 pts) début : 8h30",
  "9 à 14 (900 à 1499 pts) début : 9h30",
  "11 à 16 (1100 à 1699 pts) début : 11h30",
  "13 à 19 (1300 à 1999 pts) début : 13h30",
  "15 à 22 (1500 à 2299 pts) début : 10h30",
];

const bareme = [
  "Vainqueur : 9 points",
  "Finaliste : 6 points",
  "Demi-finaliste : 4 points",
  "Quart-de-finaliste : 2 points",
];

export default function TropheePage() {
  return (
    <main className="min-h-screen bg-card px-6 py-16 text-foreground">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
        <header className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Le Trophée
          </p>
          <h1 className="text-4xl font-semibold leading-tight">
            Trophée François Grieder
          </h1>
          <p className="text-lg leading-8 text-foreground/90">
            Le trophée du vignoble est devenu en 2016, officiellement, le trophée
            François Grieder, en hommage à son plus fidèle participant qui nous
            manque beaucoup.
          </p>
          <p className="text-lg leading-8 text-foreground/90">
            Le trophée François Grieder est un challenge établi sur la base d&apos;un
            classement général des joueurs participant aux différents tournois
            régionaux homologués organisés dans le département de la Marne et,
            depuis l&apos;année dernière, dans le département des Ardennes puisque le
            club de Tagnon organise un tour.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Saison 2024-2025</h2>
          <p className="text-base leading-7 text-foreground/90">
            Pour la saison 2024-2025, les tournois concernés sont :
          </p>
          <ul className="list-disc space-y-1 pl-6 text-base leading-7 text-foreground/90">
            {tournoisSaison2024_2025.map((tournoi) => (
              <li key={tournoi}>{tournoi}</li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Tableaux et organisation</h2>
          <p className="text-base leading-7 text-foreground/90">
            Lors de chacun de ces tournois, les tableaux organisés sont les mêmes
            :
          </p>
          <ul className="list-disc space-y-1 pl-6 text-base leading-7 text-foreground/90">
            {tableaux.map((tableau) => (
              <li key={tableau}>{tableau}</li>
            ))}
          </ul>
          <p className="text-base leading-7 text-foreground/90">
            Les tableaux se déroulent en poules de 3 joueurs où les deux premiers
            sont qualifiés pour le tableau final.
          </p>
          <div className="space-y-2 rounded-lg border border-border/60 bg-background/60 p-4">
            <p className="font-medium">Deux exceptions :</p>
            <ul className="list-disc space-y-1 pl-6 text-base leading-7 text-foreground/90">
              <li>
                Dans le tableau 5 à 6, poules de 3 joueurs où tous les joueurs
                sont qualifiés pour le tableau final.
              </li>
              <li>
                Dans le tableau 15 à 22, poules de 4 joueurs, les 3 premiers sont
                qualifiés pour le tableau final.
              </li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Classement général</h2>
          <p className="text-base leading-7 text-foreground/90">
            Pour chacun de ces huit tableaux, le classement général est calculé en
            fonction du barème suivant :
          </p>
          <ul className="list-disc space-y-1 pl-6 text-base leading-7 text-foreground/90">
            {bareme.map((ligne) => (
              <li key={ligne}>{ligne}</li>
            ))}
          </ul>
          <p className="text-base leading-7 text-foreground/90">
            En cas d&apos;égalité, le départage se fait en fonction du nombre de
            tournois disputés, puis du nombre de places de vainqueur, puis de
            finaliste et ainsi de suite. Si l&apos;égalité persiste, c&apos;est le joueur
            le plus jeune qui est placé en meilleure position.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Récompenses</h2>
          <p className="text-base leading-7 text-foreground/90">
            Chaque club consent à une mise de fond de 100€ pour récompenser les 3
            premiers de chaque classement de challenge comme suit :
          </p>
          <ul className="list-disc space-y-1 pl-6 text-base leading-7 text-foreground/90">
            <li>1er : 1 Magnum + 1 Trophée</li>
            <li>2ème : 1 Bouteille + 1 coupe</li>
            <li>3ème : 1 Bouteille + 1 petite coupe</li>
          </ul>
          <p className="text-base leading-7 text-foreground/90">
            Chaque club conserve l&apos;initiative de la dotation des différents
            tableaux de son tournoi. La cérémonie de remise des récompenses du
            trophée Grieder se déroule directement à l&apos;issue de la remise des
            récompenses du dernier tournoi disputé.
          </p>
          <p className="text-base leading-7 text-foreground/90">
            Lorsqu&apos;un joueur change de classement à mi-saison et ne peut plus
            participer à un tableau qu&apos;il disputait en première phase, il reste
            enregistré dans le classement général du tableau concerné mais ne peut
            plus y marquer de points.
          </p>
        </section>
      </div>
    </main>
  );
}
