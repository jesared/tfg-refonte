"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

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
  categoryIds: string[];
};

const initialForm: FormState = {
  nom: "",
  prenom: "",
  numeroLicence: "",
  genre: "",
  club: "",
  points: "",
  categoryIds: [],
};

export function InscriptionForm({
  tournamentId,
  categories,
}: {
  tournamentId: string;
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const parsedPoints = useMemo(() => {
    if (!form.points) {
      return null;
    }

    const value = Number.parseInt(form.points, 10);
    return Number.isNaN(value) ? null : value;
  }, [form.points]);

  const visibleCategories = useMemo(() => {
    if (parsedPoints === null) {
      return [];
    }

    return categories.filter((category) => matchesPoints(category, parsedPoints));
  }, [categories, parsedPoints]);

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
      categoryIds: form.categoryIds,
    };

    const res = await fetch("/api/registration", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const data = (await res.json()) as { error?: string };

    if (res.ok) {
      router.push("/mes-inscriptions?created=1");
      router.refresh();
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
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Jean"
        />
      </label>

      <label className="space-y-1">
        <span className="text-sm font-medium">Numéro de licence *</span>
        <input
          name="numeroLicence"
          required
          inputMode="text"
          pattern="[A-Za-z0-9]{3,9}"
          minLength={3}
          maxLength={9}
          value={form.numeroLicence}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              numeroLicence: e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 9),
            }))
          }
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="123ABC456"
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
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="1050"
        />
      </label>

      <div className="space-y-1 md:col-span-2">
        <span className="text-sm font-medium">Tableau (catégorie) *</span>
        <div className="rounded-md border border-input bg-background p-4 shadow-sm">
          <div className="space-y-2">
            {visibleCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {parsedPoints === null
                  ? "Renseignez vos points FFTT pour sélectionner un tableau."
                  : "Aucun tableau ne correspond au nombre de points saisi."}
              </p>
            ) : (
              visibleCategories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center gap-2 text-sm text-foreground/90"
                >
                  <input
                    type="checkbox"
                    name="categoryIds"
                    value={category.id}
                    checked={form.categoryIds.includes(category.id)}
                    disabled={parsedPoints === null}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        categoryIds: e.target.checked
                          ? [...prev.categoryIds, category.id]
                          : prev.categoryIds.filter((id) => id !== category.id),
                      }))
                    }
                  />
                  <span>
                    {category.nom} ({formatPointsRange(category.minPoints, category.maxPoints)})
                  </span>
                </label>
              ))
            )}
          </div>

          {parsedPoints !== null &&
            visibleCategories.length > 0 &&
            form.categoryIds.length === 0 && (
              <p className="mt-3 text-sm text-destructive">Sélectionnez au moins un tableau.</p>
            )}
        </div>
      </div>

      <div className="md:col-span-2">
        <Button
          type="submit"
          disabled={loading || form.categoryIds.length === 0}
          className="w-full"
        >
          {loading ? "Envoi..." : "S'inscrire"}
        </Button>
      </div>

      {message && (
        <p
          className={`md:col-span-2 rounded-md border px-3 py-2 text-sm ${
            message.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {message.text}
        </p>
      )}
    </form>
  );
}
