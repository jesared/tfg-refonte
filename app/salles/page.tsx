import type { Metadata } from "next";
import { MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Salles & adresses",
  description:
    "Retrouvez la salle de chaque tour du circuit, avec l'adresse complète et la ville hôte.",
};

const tours = [
  {
    id: 1,
    label: "Tour 1",
    club: "AS Gueux-Tinqueux",
    city: "Gueux",
    date: "24 août 2025",
    venue: "Complexe Sportif de Gueux",
    address: "Rue du Moutier, 51390 Gueux",
  },
  {
    id: 2,
    label: "Tour 2",
    club: "Olympique Rémois TT",
    city: "Reims",
    date: "7 septembre 2025",
    venue: "Complexe René Tys",
    address: "36 rue Léo Lagrange, 51100 Reims",
  },
  {
    id: 3,
    label: "Tour 3",
    club: "PPC Tagnon",
    city: "Tagnon",
    date: "26 octobre 2025",
    venue: "Ping Pong Club Tagnon",
    address: "Rue Gabriel Davenne, 08300 Tagnon",
  },
  {
    id: 4,
    label: "Tour 4",
    club: "PPC Epernay-Pivot",
    city: "Épernay",
    date: "7 décembre 2025",
    venue: "Gymnase Henri Viet",
    address: "Chemin de Beausoleil, 51200 Epernay",
  },
  {
    id: 5,
    label: "Tour 5",
    club: "SC Mesnil-sur-Oger",
    city: "Le Mesnil-sur-Oger",
    date: "21 décembre 2025",
    venue: "Salle du SC Mesnilois",
    address: "8 Avenue Eugène Guillaume, 51190 Le Mesnil sur Oger",
  },
  {
    id: 6,
    label: "Tour 6",
    club: "ASPTT Reims",
    city: "Reims",
    date: "4 janvier 2026",
    venue: "Gymnase Géo André",
    address: "Rue François Mauriac, 51100 Reims",
  },
  {
    id: 7,
    label: "Tour 7",
    club: "ASTT Taissy",
    city: "Taissy",
    date: "22 février 2026",
    venue: "Salle des sports de Taissy",
    address: "Esplanade Colbert, 51500 Taissy",
  },
  {
    id: 8,
    label: "Tour 8",
    club: "ASPTT Châlons",
    city: "Châlons-en-Champagne",
    date: "17 mai 2026",
    venue: "Gymnase Jean-François KIEZER",
    address: "15 rue Jacques Duclos, 51000 Châlons-en-Champagne",
  },
];

export default function SallesPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <section className="rounded-3xl border border-border bg-card px-5 py-6 shadow-sm sm:px-6 sm:py-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Organisation des tours
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">Salles & adresses</h1>
        <p className="mt-3 max-w-3xl text-base text-muted-foreground sm:text-lg">
          Chaque tour se joue dans une ville différente. Voici la salle exacte pour vous organiser
          (GPS, covoiturage, horaires d’arrivée).
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {tours.map((tour) => (
          <article key={tour.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{tour.label}</p>
                <h2 className="mt-1 text-xl font-semibold text-foreground">{tour.city}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{tour.club}</p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {tour.date}
              </span>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <p className="font-medium text-foreground">{tour.venue}</p>
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{tour.address}</span>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tour.address)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
              >
                <MapPin className="h-4 w-4" />
                Ouvrir dans Google Maps
              </a>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
