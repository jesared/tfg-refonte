"use client";

import { FormEvent, useMemo, useState } from "react";

type FormState = {
  nom: string;
  prenom: string;
  numeroLicence: string;
  genre: "" | "M" | "F";
  club: string;
  points: string;
  tableau: string;
};

const TABLEAUX = [
  { value: "0-899", label: "Tableau 0-899" },
  { value: "900-1299", label: "Tableau 900-1299" },
  { value: "1300-1599", label: "Tableau 1300-1599" },
  { value: "1600+", label: "Tableau 1600+" },
];

const initialForm: FormState = {
  nom: "",
  prenom: "",
  numeroLicence: "",
  genre: "",
  club: "",
  points: "",
  tableau: "",
};

function suggestTableau(points: number): string {
  if (points <= 899) return "0-899";
  if (points <= 1299) return "900-1299";
  if (points <= 1599) return "1300-1599";
  return "1600+";
}

export default function InscriptionPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const pointsAsNumber = useMemo(() => Number.parseInt(form.points, 10), [form.points]);
  const suggestedTableau = Number.isFinite(pointsAsNumber) ? suggestTableau(pointsAsNumber) : null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const payload = {
      nom: form.nom.trim(),
      prenom: form.prenom.trim(),
      numeroLicence: form.numeroLicence.trim(),
      genre: form.genre || null,
      club: form.club.trim(),
      points: form.points ? Number.parseInt(form.points, 10) : null,
      tableau: form.tableau,
    };

    const res = await fetch("/api/registration", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const data = (await res.json()) as { error?: string };

    if (res.ok) {
      setMessage({ type: "success", text: "Inscription enregistrée avec succès." });
      setForm(initialForm);
    } else {
      setMessage({ type: "error", text: data.error || "Erreur lors de l'inscription." });
    }

    setLoading(false);
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 md:py-12">
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Inscription au tournoi</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Remplissez le formulaire ci-dessous pour vous inscrire. Tous les champs marqués d’un * sont
          obligatoires.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-medium">Nom *</span>
            <input
              name="nom"
              required
              value={form.nom}
              onChange={(e) => setForm((prev) => ({ ...prev, nom: e.target.value }))}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              placeholder="Dupont"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Prénom *</span>
            <input
              name="prenom"
              required
              value={form.prenom}
              onChange={(e) => setForm((prev) => ({ ...prev, prenom: e.target.value }))}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              placeholder="Jean"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Numéro de licence *</span>
            <input
              name="numeroLicence"
              required
              minLength={6}
              value={form.numeroLicence}
              onChange={(e) => setForm((prev) => ({ ...prev, numeroLicence: e.target.value }))}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              placeholder="123456"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Genre</span>
            <select
              name="genre"
              value={form.genre}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, genre: e.target.value as "" | "M" | "F" }))
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="">Non précisé</option>
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Club *</span>
            <input
              name="club"
              required
              value={form.club}
              onChange={(e) => setForm((prev) => ({ ...prev, club: e.target.value }))}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              placeholder="TT Strasbourg"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Points FFTT *</span>
            <input
              name="points"
              type="number"
              required
              min={0}
              value={form.points}
              onChange={(e) => {
                const next = e.target.value;
                setForm((prev) => ({
                  ...prev,
                  points: next,
                  tableau: next ? suggestTableau(Number.parseInt(next, 10)) : prev.tableau,
                }));
              }}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              placeholder="1050"
            />
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-sm font-medium">Tableau *</span>
            <select
              name="tableau"
              required
              value={form.tableau}
              onChange={(e) => setForm((prev) => ({ ...prev, tableau: e.target.value }))}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="">Choisir un tableau</option>
              {TABLEAUX.map((tableau) => (
                <option key={tableau.value} value={tableau.value}>
                  {tableau.label}
                </option>
              ))}
            </select>
            {suggestedTableau && (
              <p className="text-xs text-muted-foreground">
                Suggestion automatique selon vos points : <strong>{suggestedTableau}</strong>
              </p>
            )}
          </label>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Envoi..." : "S'inscrire"}
            </button>
          </div>

          {message && (
            <p
              className={`md:col-span-2 rounded-md border px-3 py-2 text-sm ${
                message.type === "success"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message.text}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
