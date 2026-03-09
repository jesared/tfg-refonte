"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type FormState = {
  nom: string;
  heureDebut: string;
  heureFin: string;
  minPoints: string;
  maxPoints: string;
  maxJoueurs: string;
  tournamentId: string;
};

const initialState: FormState = {
  nom: "",
  heureDebut: "",
  heureFin: "",
  minPoints: "",
  maxPoints: "",
  maxJoueurs: "",
  tournamentId: "",
};

export function NewCategoryForm({
  tournamentId,
  backHref,
}: {
  tournamentId: string | null;
  backHref: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({ ...initialState, tournamentId: tournamentId ?? "" });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, tournamentId: tournamentId ?? "" }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "Impossible de créer la catégorie.");
      setLoading(false);
      return;
    }

    router.push(backHref);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">Nom de la catégorie</label>
        <input
          required
          value={form.nom}
          onChange={(e) => setForm((prev) => ({ ...prev, nom: e.target.value }))}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          placeholder="Ex: Dames -1500"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Heure de début</label>
          <input
            type="time"
            required
            value={form.heureDebut}
            onChange={(e) => setForm((prev) => ({ ...prev, heureDebut: e.target.value }))}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Heure de fin (optionnel)</label>
          <input
            type="time"
            value={form.heureFin}
            onChange={(e) => setForm((prev) => ({ ...prev, heureFin: e.target.value }))}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Min points</label>
          <input
            type="number"
            value={form.minPoints}
            onChange={(e) => setForm((prev) => ({ ...prev, minPoints: e.target.value }))}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Max points</label>
          <input
            type="number"
            value={form.maxPoints}
            onChange={(e) => setForm((prev) => ({ ...prev, maxPoints: e.target.value }))}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Max joueurs</label>
          <input
            type="number"
            value={form.maxJoueurs}
            onChange={(e) => setForm((prev) => ({ ...prev, maxJoueurs: e.target.value }))}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          {loading ? "Création..." : "Créer la catégorie"}
        </button>
        <Link href={backHref} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground">
          Annuler
        </Link>
      </div>
    </form>
  );
}
