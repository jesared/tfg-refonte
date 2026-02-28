import type { Metadata } from "next";
import { MapPin } from "lucide-react";

import { getAgendaTours } from "@/lib/agenda";

export const metadata: Metadata = {
  title: "Agenda & salles",
  description:
    "Agenda officiel de la saison 2025-2026 avec les clubs organisateurs, salles et adresses.",
};

export default async function AgendaPage() {
  const tours2025_2026 = await getAgendaTours();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <section className="flex flex-col gap-4 rounded-3xl border border-border bg-card px-5 py-6 shadow-sm sm:px-6 sm:py-8">
        <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <span className="text-lg">🗓️</span>
          <span>Agenda & salles</span>
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">Saison 2025-2026</h1>
          <p className="text-base text-muted-foreground sm:text-lg">
            Retrouvez les dates, clubs organisateurs, salles et adresses des différents tours du
            Trophée François Grieder.
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="px-3 py-2 font-medium">Tour</th>
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Club organisateur</th>
              </tr>
            </thead>
            <tbody>
              {tours2025_2026.map((tour) => (
                <tr key={tour.id} className="border-b border-border/60 last:border-0">
                  <td className="px-3 py-3 font-semibold text-foreground">{tour.label}</td>
                  <td className="px-3 py-3 text-foreground/90">{tour.date}</td>
                  <td className="px-3 py-3 text-foreground/90">{tour.club}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {tours2025_2026.map((tour) => (
          <article key={tour.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {tour.label}
                </p>
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
