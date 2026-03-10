"use client";

import { FormEvent, useMemo, useState } from "react";

type CategoryOption = {
  id: string;
  nom: string;
  minPoints: number | null;
  maxPoints: number | null;
};

function formatPointsRange(minPoints: number | null, maxPoints: number | null) {
  if (minPoints !== null && maxPoints !== null) {
    return `${minPoints} - ${maxPoints} pts`;
  }

  if (minPoints !== null) {
    return `≥ ${minPoints} pts`;
  }

  if (maxPoints !== null) {
    return `≤ ${maxPoints} pts`;
  }

  return "Tous points";
}

function matchesPoints(category: CategoryOption, points: number | null) {
  if (points === null) {
    return true;
  }

  if (category.minPoints !== null && points < category.minPoints) {
    return false;
  }

  if (category.maxPoints !== null && points > category.maxPoints) {
    return false;
  }

  return true;
}

type FormState = {
  nom: string;
  prenom: string;
  numeroLicence: string;
  genre: "" | "M" | "F";
  club: string;
  points: string;
  categoryId: string;
};

const initialForm: FormState = {
  nom: "",
  prenom: "",
  numeroLicence: "",
  genre: "",
  club: "",
  points: "",
  categoryId: "",
};

export function InscriptionForm({
  tournamentId,
  categories,
}: {
  tournamentId: string;
  categories: CategoryOption[];
}) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [filterByPoints, setFilterByPoints] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const parsedPoints = useMemo(() => {
    if (!form.points) {
      return null;
    }

    const value = Number.parseInt(form.points, 10);
    return Number.isNaN(value) ? null : value;
  }, [form.points]);

  const visibleCategories = useMemo(() => {
    if (!filterByPoints || parsedPoints === null) {
      return categories;
    }

    return categories.filter((category) => matchesPoints(category, parsedPoints));
  }, [categories, filterByPoints, parsedPoints]);

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
      tournamentId,
      categoryId: form.categoryId,
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
          onChange={(e) => setForm((prev) => ({ ...prev, points: e.target.value }))}
          className="w-full rounded-md border border-input bg-background px-3 py-2"
          placeholder="1050"
        />
      </label>

      <div className="space-y-1 md:col-span-2">
        <span className="text-sm font-medium">Tableau (catégorie) *</span>
        <div className="rounded-md border border-input bg-background p-3">
          <label className="mb-3 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filterByPoints}
              onChange={(e) => setFilterByPoints(e.target.checked)}
            />
            Filtrer les tableaux selon mes points FFTT
          </label>

          <div className="space-y-2">
            {visibleCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun tableau ne correspond au nombre de points saisi.
              </p>
            ) : (
              visibleCategories.map((category) => (
                <label key={category.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="categoryId"
                    required
                    value={category.id}
                    checked={form.categoryId === category.id}
                    onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
                  />
                  <span>
                    {category.nom} ({formatPointsRange(category.minPoints, category.maxPoints)})
                  </span>
                </label>
              ))
            )}
          </div>
        </div>
      </div>

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
  );
}
