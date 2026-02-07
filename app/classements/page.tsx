import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Classements",
  description:
    "Barème et classement général du Trophée François Grieder, avec règles de départage.",
};

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

export default function ClassementsPage() {
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
            Retrouvez ici le mode de calcul des points et les règles de départage
            qui serviront à établir le classement général. Cette page est prête
            pour l&apos;ajout dynamique des résultats à venir.
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Classement général
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Structure prête pour alimenter les résultats automatiquement.
              </p>
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Données à venir
            </span>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Rang</th>
                  <th className="px-4 py-3 font-semibold">Club</th>
                  <th className="px-4 py-3 font-semibold">Points</th>
                  <th className="px-4 py-3 font-semibold">Tournois joués</th>
                  <th className="px-4 py-3 font-semibold">Meilleur résultat</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-100 bg-white">
                  <td
                    className="px-4 py-6 text-center text-sm text-slate-500"
                    colSpan={5}
                  >
                    Les résultats apparaîtront ici dès la mise à jour dynamique du
                    classement.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
