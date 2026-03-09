"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type FormState = {
  nom: string;
  horaire: string;
  minPoints: string;
  maxPoints: string;
  maxJoueurs: string;
  tournamentId: string;
};

const initialState: FormState = {
  nom: "",
  horaire: "",
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
    <form onSubmit={handleSubmit} className="space-y-4 rounded border p-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Nom de la catégorie</label>
        <input
          required
          value={form.nom}
          onChange={(e) => setForm((prev) => ({ ...prev, nom: e.target.value }))}
          className="w-full rounded border p-2"
          placeholder="Ex: Dames -1500"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Horaire</label>
        <input
          type="time"
          value={form.horaire}
          onChange={(e) => setForm((prev) => ({ ...prev, horaire: e.target.value }))}
          className="w-full rounded border p-2"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Min points</label>
          <input
            type="number"
            value={form.minPoints}
            onChange={(e) => setForm((prev) => ({ ...prev, minPoints: e.target.value }))}
            className="w-full rounded border p-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Max points</label>
          <input
            type="number"
            value={form.maxPoints}
            onChange={(e) => setForm((prev) => ({ ...prev, maxPoints: e.target.value }))}
            className="w-full rounded border p-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Max joueurs</label>
          <input
            type="number"
            value={form.maxJoueurs}
            onChange={(e) => setForm((prev) => ({ ...prev, maxJoueurs: e.target.value }))}
            className="w-full rounded border p-2"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="rounded bg-green-600 px-4 py-2 text-white">
          {loading ? "Création..." : "Créer la catégorie"}
        </button>
        <Link href={backHref} className="rounded border px-4 py-2 text-sm">
          Annuler
        </Link>
      </div>
    </form>
  );
}
