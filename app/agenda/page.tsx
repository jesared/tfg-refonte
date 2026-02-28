import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agenda",
  description: "Agenda officiel des tours de la saison 2025-2026 du Trophée François Grieder.",
};

type Etape = {
  tour: string;
  date: string;
  club: string;
};

const agenda2025_2026: Etape[] = [
  { tour: "Tour 1", date: "24 août 2025", club: "AS Gueux-Tinqueux" },
  { tour: "Tour 2", date: "7 septembre 2025", club: "Olympique Rémois TT" },
  { tour: "Tour 3", date: "26 octobre 2025", club: "PPC Tagnon" },
  { tour: "Tour 4", date: "7 décembre 2025", club: "PPC Epernay-Pivot" },
  { tour: "Tour 5", date: "21 décembre 2025", club: "SC Mesnil-sur-Oger" },
  { tour: "Tour 6", date: "4 janvier 2026", club: "ASPTT Reims" },
  { tour: "Tour 7", date: "22 février 2026", club: "ASTT Taissy" },
  { tour: "Tour 8", date: "17 mai 2026", club: "ASPTT Châlons" },
];

export default function AgendaPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <section className="flex flex-col gap-4 rounded-3xl border border-border bg-card px-5 py-6 shadow-sm sm:px-6 sm:py-8">
        <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <span className="text-lg">🗓️</span>
          <span>Agenda officiel</span>
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">Saison 2025-2026</h1>
          <p className="text-base text-muted-foreground sm:text-lg">
            Retrouvez les dates et clubs organisateurs des différents tours du Trophée François
            Grieder. Cette page reprend le calendrier officiel de la saison.
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
              {agenda2025_2026.map((etape) => (
                <tr key={etape.tour} className="border-b border-border/60 last:border-0">
                  <td className="px-3 py-3 font-semibold text-foreground">{etape.tour}</td>
                  <td className="px-3 py-3 text-foreground/90">{etape.date}</td>
                  <td className="px-3 py-3 text-foreground/90">{etape.club}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
