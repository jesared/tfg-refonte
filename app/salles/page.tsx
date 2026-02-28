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
    club: "Reims Olympique TT",
    city: "Reims",
    date: "14 septembre 2026",
    venue: "Complexe René Tys",
    address: "12 Rue du Docteur Albert Schweitzer, 51100 Reims",
  },
  {
    id: 2,
    label: "Tour 2",
    club: "TT Châlons",
    city: "Châlons-en-Champagne",
    date: "12 octobre 2026",
    venue: "Gymnase Pierre de Coubertin",
    address: "5 Avenue Pierre de Coubertin, 51000 Châlons-en-Champagne",
  },
  {
    id: 3,
    label: "Tour 3",
    club: "Rethel TT",
    city: "Rethel",
    date: "9 novembre 2026",
    venue: "Salle Jean Moulin",
    address: "8 Rue Jean Moulin, 08300 Rethel",
  },
  {
    id: 4,
    label: "Tour 4",
    club: "Sedan Ardennes TT",
    city: "Sedan",
    date: "14 décembre 2026",
    venue: "Complexe Sportif Esplanade",
    address: "2 Rue de l'Esplanade, 08200 Sedan",
  },
  {
    id: 5,
    label: "Tour 5",
    club: "Épernay Ping",
    city: "Épernay",
    date: "18 janvier 2027",
    venue: "Gymnase Henri Viet",
    address: "30 Rue Henri Martin, 51200 Épernay",
  },
  {
    id: 6,
    label: "Tour 6",
    club: "Charleville TT",
    city: "Charleville-Mézières",
    date: "15 février 2027",
    venue: "Halle des Sports Bayard",
    address: "11 Avenue de Manchester, 08000 Charleville-Mézières",
  },
  {
    id: 7,
    label: "Tour 7",
    club: "Tinqueux TT",
    city: "Tinqueux",
    date: "15 mars 2027",
    venue: "Salle des Tanneurs",
    address: "4 Rue des Tanneurs, 51430 Tinqueux",
  },
  {
    id: 8,
    label: "Tour 8",
    club: "Vouziers TT",
    city: "Vouziers",
    date: "12 avril 2027",
    venue: "Complexe Roger Marche",
    address: "17 Rue Bournizet, 08400 Vouziers",
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
