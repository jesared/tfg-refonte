const tournois = [
  {
    date: "25 août 2024",
    lieu: "Gueux",
    club: "Gueux",
  },
  {
    date: "08 septembre 2024",
    lieu: "ORTT",
    club: "ORTT",
  },
  {
    date: "27 octobre 2024",
    lieu: "Tagnon",
    club: "Tagnon",
  },
  {
    date: "08 décembre 2024",
    lieu: "Épernay",
    club: "Épernay",
  },
  {
    date: "22 décembre 2024",
    lieu: "Mesnil",
    club: "Mesnil",
  },
  {
    date: "05 janvier 2025",
    lieu: "PTT Reims",
    club: "PTT Reims",
  },
  {
    date: "11 février 2025",
    lieu: "PTT Châlons",
    club: "PTT Châlons",
  },
  {
    date: "02 mars 2025",
    lieu: "Taissy",
    club: "Taissy",
  },
];

export default function Saison20242025Page() {
  return (
    <main className="min-h-screen bg-white px-6 py-16 text-zinc-900">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Saison 2024–2025
          </p>
          <h1 className="text-3xl font-semibold">Tournois 2024–2025</h1>
          <p className="max-w-2xl text-base text-zinc-600">
            Retrouvez ci-dessous la liste structurée des tournois prévus pour la saison
            2024–2025, avec la date, le lieu et le club organisateur.
          </p>
        </header>

        <section className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-6 shadow-sm">
          <div className="grid gap-4">
            <div className="grid grid-cols-1 gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 sm:grid-cols-3">
              <span>Date</span>
              <span>Lieu</span>
              <span>Club organisateur</span>
            </div>
            <div className="divide-y divide-zinc-200">
              {tournois.map((tournoi) => (
                <div
                  key={`${tournoi.date}-${tournoi.lieu}`}
                  className="grid grid-cols-1 gap-2 py-4 text-sm text-zinc-700 sm:grid-cols-3"
                >
                  <span className="font-medium text-zinc-900">{tournoi.date}</span>
                  <span>{tournoi.lieu}</span>
                  <span>{tournoi.club}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
