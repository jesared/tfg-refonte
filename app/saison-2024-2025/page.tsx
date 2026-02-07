type TournoiDocument = {
  label: string;
  url: string;
};

type Tournoi = {
  date: string;
  lieu: string;
  club: string;
  documents: TournoiDocument[];
  resultatsUrl?: string;
};

const tournois: Tournoi[] = [
  {
    date: "25 août 2024",
    lieu: "Gueux",
    club: "Gueux",
    documents: [],
  },
  {
    date: "08 septembre 2024",
    lieu: "ORTT",
    club: "ORTT",
    documents: [],
  },
  {
    date: "27 octobre 2024",
    lieu: "Tagnon",
    club: "Tagnon",
    documents: [],
  },
  {
    date: "08 décembre 2024",
    lieu: "Épernay",
    club: "Épernay",
    documents: [],
  },
  {
    date: "22 décembre 2024",
    lieu: "Mesnil",
    club: "Mesnil",
    documents: [],
  },
  {
    date: "05 janvier 2025",
    lieu: "PTT Reims",
    club: "PTT Reims",
    documents: [],
  },
  {
    date: "11 février 2025",
    lieu: "PTT Châlons",
    club: "PTT Châlons",
    documents: [],
  },
  {
    date: "02 mars 2025",
    lieu: "Taissy",
    club: "Taissy",
    documents: [],
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
            2024–2025, avec la date, le lieu, le club organisateur, ainsi que les documents
            téléchargeables et les classements lorsqu’ils sont disponibles.
          </p>
        </header>

        <section className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-6 shadow-sm">
          <div className="grid gap-4">
            <div className="grid grid-cols-1 gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 sm:grid-cols-[1.1fr_1fr_1fr_1.2fr_0.9fr]">
              <span>Date</span>
              <span>Lieu</span>
              <span>Club organisateur</span>
              <span>Documents</span>
              <span>Résultats</span>
            </div>
            <div className="divide-y divide-zinc-200">
              {tournois.map((tournoi) => (
                <div
                  key={`${tournoi.date}-${tournoi.lieu}`}
                  className="grid grid-cols-1 gap-2 py-4 text-sm text-zinc-700 sm:grid-cols-[1.1fr_1fr_1fr_1.2fr_0.9fr]"
                >
                  <span className="font-medium text-zinc-900">{tournoi.date}</span>
                  <span>{tournoi.lieu}</span>
                  <span>{tournoi.club}</span>
                  <div className="flex flex-col gap-1 text-zinc-600">
                    {tournoi.documents.length > 0 ? (
                      tournoi.documents.map((document) => (
                        <a
                          key={document.label}
                          href={document.url}
                          className="text-sm font-medium text-emerald-700 transition hover:text-emerald-900"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {document.label}
                        </a>
                      ))
                    ) : (
                      <span className="text-sm text-zinc-400">Aucun document disponible</span>
                    )}
                  </div>
                  <div>
                    {tournoi.resultatsUrl ? (
                      <a
                        href={tournoi.resultatsUrl}
                        className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Voir résultats
                      </a>
                    ) : (
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                        Classement à venir
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
