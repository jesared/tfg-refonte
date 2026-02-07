"use client";

import { useMemo, useState } from "react";

const points = [
  { label: "Vainqueur", value: "9 pts" },
  { label: "Finaliste", value: "6 pts" },
  { label: "Demi-finaliste", value: "4 pts" },
  { label: "Quart de finale", value: "2 pts" },
];

const tieBreakers = [
  "Total de points sur l'ensemble des tournois.",
  "Meilleur résultat obtenu sur un tournoi.",
  "Nombre de participations (priorité aux clubs les plus assidus).",
  "Tirage au sort par le comité d'organisation si l'égalité persiste.",
];

const classementSeasons = [
  {
    season: "2024-2025",
    tournaments: [
      {
        name: "Open de Genève",
        date: "14 septembre 2024",
        location: "Centre sportif de la Queue-d'Arve",
        category: "Senior",
        pdfUrl: "/pdfs/classements-2024-geneve.pdf",
      },
      {
        name: "Tournoi du Jura",
        date: "12 octobre 2024",
        location: "Complexe de Delémont",
        category: "Senior",
        pdfUrl: "/pdfs/classements-2024-jura.pdf",
      },
      {
        name: "Masters de Lausanne",
        date: "16 novembre 2024",
        location: "Vaudoise Arena",
        category: "Elite",
        pdfUrl: "/pdfs/classements-2024-lausanne.pdf",
      },
    ],
  },
  {
    season: "2023-2024",
    tournaments: [
      {
        name: "Open de Fribourg",
        date: "23 septembre 2023",
        location: "Salle Saint-Léonard",
        category: "Senior",
        pdfUrl: "/pdfs/classements-2023-fribourg.pdf",
      },
      {
        name: "Tournoi de Neuchâtel",
        date: "21 octobre 2023",
        location: "Patinoire du Littoral",
        category: "Senior",
        pdfUrl: "/pdfs/classements-2023-neuchatel.pdf",
      },
      {
        name: "Finales de Berne",
        date: "02 décembre 2023",
        location: "PostFinance Arena",
        category: "Elite",
        pdfUrl: "/pdfs/classements-2023-berne.pdf",
      },
    ],
  },
  {
    season: "2022-2023",
    tournaments: [
      {
        name: "Léman Indoor",
        date: "17 septembre 2022",
        location: "Montreux Sports Center",
        category: "Senior",
        pdfUrl: "/pdfs/classements-2022-leman.pdf",
      },
      {
        name: "Tournoi de Sion",
        date: "15 octobre 2022",
        location: "Centre sportif des Iles",
        category: "Senior",
        pdfUrl: "/pdfs/classements-2022-sion.pdf",
      },
    ],
  },
];

export default function ClassementsContent() {
  const [seasonFilter, setSeasonFilter] = useState("Toutes saisons");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSeasons = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return classementSeasons
      .filter((season) =>
        seasonFilter === "Toutes saisons"
          ? true
          : season.season === seasonFilter,
      )
      .map((season) => {
        const tournaments = season.tournaments.filter((tournament) => {
          if (!normalizedSearch) return true;
          const haystack = [
            tournament.name,
            tournament.location,
            tournament.category,
          ]
            .join(" ")
            .toLowerCase();
          return haystack.includes(normalizedSearch);
        });

        return { ...season, tournaments };
      })
      .filter((season) => season.tournaments.length > 0);
  }, [seasonFilter, searchTerm]);

  const totalPdfCount = filteredSeasons.reduce(
    (sum, season) => sum + season.tournaments.length,
    0,
  );

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-900">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <header className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
            Classements
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-slate-900">
            Barème & classement général
          </h1>
          <p className="max-w-3xl text-lg text-slate-600">
            Retrouvez ici le mode de calcul des points et les classements PDF par
            tournoi. Les saisons sont regroupées pour retrouver rapidement les
            résultats historiques.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-8 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              Calcul des points
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Le barème est appliqué à chaque tournoi pour cumuler les points.
            </p>
            <ul className="mt-6 space-y-3">
              {points.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <span className="text-sm font-medium text-slate-700">
                    {item.label}
                  </span>
                  <span className="text-sm font-semibold text-slate-900">
                    {item.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-8 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              Règles de départage
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              En cas d&apos;égalité au classement général, l&apos;ordre suivant est
              appliqué.
            </p>
            <ol className="mt-6 space-y-3 text-sm text-slate-700">
              {tieBreakers.map((rule, index) => (
                <li
                  key={rule}
                  className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{rule}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white px-6 py-8 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Classements PDF par saison
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Téléchargez les résultats officiels tournoi par tournoi.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <label className="flex flex-col text-xs font-semibold uppercase tracking-wide text-slate-500">
                Saison
                <select
                  className="mt-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
                  value={seasonFilter}
                  onChange={(event) => setSeasonFilter(event.target.value)}
                >
                  <option>Toutes saisons</option>
                  {classementSeasons.map((season) => (
                    <option key={season.season} value={season.season}>
                      {season.season}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col text-xs font-semibold uppercase tracking-wide text-slate-500">
                Filtre tournoi
                <input
                  className="mt-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
                  placeholder="Rechercher un tournoi"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </label>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            {totalPdfCount} classement{totalPdfCount > 1 ? "s" : ""} disponible
            {totalPdfCount > 1 ? "s" : ""}.
          </div>

          <div className="mt-6 space-y-8">
            {filteredSeasons.map((season) => (
              <div key={season.season} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Saison {season.season}
                  </h3>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {season.tournaments.length} tournoi
                    {season.tournaments.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  {season.tournaments.map((tournament) => (
                    <div
                      key={tournament.name}
                      className="flex h-full flex-col justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
                    >
                      <div className="space-y-2">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                          {tournament.category}
                        </p>
                        <h4 className="text-lg font-semibold text-slate-900">
                          {tournament.name}
                        </h4>
                        <p className="text-sm text-slate-600">
                          {tournament.location}
                        </p>
                        <p className="text-sm font-medium text-slate-500">
                          {tournament.date}
                        </p>
                      </div>
                      <a
                        className="mt-4 inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
                        href={tournament.pdfUrl}
                      >
                        Télécharger le PDF
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {filteredSeasons.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                Aucun tournoi ne correspond à ces filtres pour le moment.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
