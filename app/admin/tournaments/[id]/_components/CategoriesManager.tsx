"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  nom: string;
  minPoints: number | null;
  maxPoints: number | null;
  maxJoueurs: number | null;
};

type CategoryForm = {
  nom: string;
  minPoints: string;
  maxPoints: string;
  maxJoueurs: string;
};

function toPayload(form: CategoryForm) {
  return {
    nom: form.nom.trim(),
    minPoints: form.minPoints,
    maxPoints: form.maxPoints,
    maxJoueurs: form.maxJoueurs,
  };
}

function toForm(category: Category): CategoryForm {
  return {
    nom: category.nom,
    minPoints: category.minPoints?.toString() ?? "",
    maxPoints: category.maxPoints?.toString() ?? "",
    maxJoueurs: category.maxJoueurs?.toString() ?? "",
  };
}

export function CategoriesManager({
  tournamentId,
  tournamentTour,
  initialCategories,
}: {
  tournamentId: string;
  tournamentTour: number;
  initialCategories: Category[];
}) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [newCategory, setNewCategory] = useState<CategoryForm>({
    nom: "",
    minPoints: "",
    maxPoints: "",
    maxJoueurs: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingForm, setEditingForm] = useState<CategoryForm>({
    nom: "",
    minPoints: "",
    maxPoints: "",
    maxJoueurs: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function addCategory() {
    setLoading(true);
    setError(null);
    const response = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tournamentId, ...toPayload(newCategory) }),
    });

    const body = (await response.json().catch(() => null)) as Category & { error?: string };
    if (!response.ok) {
      setError(body?.error ?? "Impossible d'ajouter la catégorie.");
      setLoading(false);
      return;
    }

    setCategories((prev) => [...prev, body].sort((a, b) => a.nom.localeCompare(b.nom)));
    setNewCategory({ nom: "", minPoints: "", maxPoints: "", maxJoueurs: "" });
    setLoading(false);
    router.refresh();
  }

  function startEdit(category: Category) {
    setEditingId(category.id);
    setEditingForm(toForm(category));
  }

  async function saveEdit() {
    if (!editingId) return;
    setLoading(true);
    setError(null);

    const response = await fetch(`/api/categories/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toPayload(editingForm)),
    });

    const body = (await response.json().catch(() => null)) as Category & { error?: string };
    if (!response.ok) {
      setError(body?.error ?? "Impossible de modifier la catégorie.");
      setLoading(false);
      return;
    }

    setCategories((prev) =>
      prev
        .map((item) => (item.id === editingId ? body : item))
        .sort((a, b) => a.nom.localeCompare(b.nom)),
    );
    setEditingId(null);
    setLoading(false);
    router.refresh();
  }

  async function deleteCategory(id: string) {
    setLoading(true);
    setError(null);

    const response = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "Impossible de supprimer la catégorie.");
      setLoading(false);
      return;
    }

    setCategories((prev) => prev.filter((item) => item.id !== id));
    setLoading(false);
    router.refresh();
  }

  return (
    <section className="rounded border p-4 space-y-4">
      <h2 className="font-semibold">Catégories (Tour {tournamentTour})</h2>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid gap-2 md:grid-cols-4">
        <input
          placeholder="Nom"
          value={newCategory.nom}
          onChange={(e) => setNewCategory((p) => ({ ...p, nom: e.target.value }))}
          className="rounded border p-2 text-sm"
        />
        <input
          type="number"
          placeholder="Min points"
          value={newCategory.minPoints}
          onChange={(e) => setNewCategory((p) => ({ ...p, minPoints: e.target.value }))}
          className="rounded border p-2 text-sm"
        />
        <input
          type="number"
          placeholder="Max points"
          value={newCategory.maxPoints}
          onChange={(e) => setNewCategory((p) => ({ ...p, maxPoints: e.target.value }))}
          className="rounded border p-2 text-sm"
        />
        <input
          type="number"
          placeholder="Max joueurs"
          value={newCategory.maxJoueurs}
          onChange={(e) => setNewCategory((p) => ({ ...p, maxJoueurs: e.target.value }))}
          className="rounded border p-2 text-sm"
        />
      </div>
      <button
        type="button"
        onClick={addCategory}
        disabled={loading || !newCategory.nom.trim()}
        className="rounded bg-green-600 px-3 py-2 text-sm text-white disabled:opacity-70"
      >
        Ajouter une catégorie
      </button>

      {categories.length === 0 ? (
        <p className="text-sm text-gray-500">Aucune catégorie pour le moment.</p>
      ) : (
        <ul className="space-y-2">
          {categories.map((category) => (
            <li key={category.id} className="rounded border p-2 text-sm space-y-2">
              {editingId === category.id ? (
                <>
                  <div className="grid gap-2 md:grid-cols-4">
                    <input
                      value={editingForm.nom}
                      onChange={(e) => setEditingForm((p) => ({ ...p, nom: e.target.value }))}
                      className="rounded border p-2"
                    />
                    <input
                      type="number"
                      value={editingForm.minPoints}
                      onChange={(e) => setEditingForm((p) => ({ ...p, minPoints: e.target.value }))}
                      className="rounded border p-2"
                    />
                    <input
                      type="number"
                      value={editingForm.maxPoints}
                      onChange={(e) => setEditingForm((p) => ({ ...p, maxPoints: e.target.value }))}
                      className="rounded border p-2"
                    />
                    <input
                      type="number"
                      value={editingForm.maxJoueurs}
                      onChange={(e) =>
                        setEditingForm((p) => ({ ...p, maxJoueurs: e.target.value }))
                      }
                      className="rounded border p-2"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={saveEdit}
                      disabled={loading || !editingForm.nom.trim()}
                      className="rounded bg-blue-600 px-3 py-1.5 text-white"
                    >
                      Enregistrer
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded border px-3 py-1.5"
                    >
                      Annuler
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="font-medium">{category.nom}</p>
                  <p className="text-xs text-gray-600">
                    Points: {category.minPoints ?? "-∞"} → {category.maxPoints ?? "+∞"} · Max
                    joueurs: {category.maxJoueurs ?? "Non limité"}
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => startEdit(category)}
                      className="text-blue-600"
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCategory(category.id)}
                      className="text-red-600"
                    >
                      Supprimer
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
