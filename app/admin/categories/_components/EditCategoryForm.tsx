"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type FormState = {
  nom: string;
  minPoints: string;
  maxPoints: string;
  maxJoueurs: string;
};

export function EditCategoryForm({
  category,
  backHref,
}: {
  category: { id: string; nom: string; minPoints: number | null; maxPoints: number | null; maxJoueurs: number | null };
  backHref: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    nom: category.nom,
    minPoints: category.minPoints?.toString() ?? "",
    maxPoints: category.maxPoints?.toString() ?? "",
    maxJoueurs: category.maxJoueurs?.toString() ?? "",
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch(`/api/categories/${category.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "Impossible de modifier la catégorie.");
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
        <button type="submit" disabled={loading} className="rounded bg-blue-600 px-4 py-2 text-white">
          {loading ? "Mise à jour..." : "Modifier pour tous les tours"}
        </button>
        <Link href={backHref} className="rounded border px-4 py-2 text-sm">
          Annuler
        </Link>
      </div>
    </form>
  );
}
