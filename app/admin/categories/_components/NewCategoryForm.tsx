"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type TournamentOption = {
  id: string;
  nom: string;
  date: string;
  tour: number;
};

type FormState = {
  nom: string;
  tournamentId: string;
  minPoints: string;
  maxPoints: string;
  maxJoueurs: string;
};

const initialState: FormState = {
  nom: "",
  tournamentId: "",
  minPoints: "",
  maxPoints: "",
  maxJoueurs: "",
};

export function NewCategoryForm({
  tournaments,
  defaultTournamentId,
}: {
  tournaments: TournamentOption[];
  defaultTournamentId?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultTournament = useMemo(
    () => tournaments.find((item) => item.id === defaultTournamentId)?.id ?? "",
    [defaultTournamentId, tournaments],
  );

  const [form, setForm] = useState<FormState>({ ...initialState, tournamentId: defaultTournament });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "Impossible de créer la catégorie.");
      setLoading(false);
      return;
    }

    router.push(`/admin/tournaments/${form.tournamentId}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded border p-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Tournoi</label>
        <select
          required
          value={form.tournamentId}
          onChange={(e) => setForm((prev) => ({ ...prev, tournamentId: e.target.value }))}
          className="w-full rounded border p-2"
        >
          <option value="">Sélectionner un tournoi</option>
          {tournaments.map((tournament) => (
            <option key={tournament.id} value={tournament.id}>
              {tournament.nom} · Tour {tournament.tour} · {new Date(tournament.date).toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>

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
        <Link href="/admin/tournaments" className="rounded border px-4 py-2 text-sm">
          Annuler
        </Link>
      </div>
    </form>
  );
}
