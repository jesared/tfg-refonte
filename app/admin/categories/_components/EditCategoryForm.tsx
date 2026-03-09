"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { CategoryFormFields, CategoryFormValues } from "@/app/admin/categories/_components/CategoryFormFields";

type FormState = CategoryFormValues;

export function EditCategoryForm({
  category,
  backHref,
  allowEditMaxJoueurs,
}: {
  category: {
    id: string;
    nom: string;
    heureDebut: string;
    heureFin: string | null;
    minPoints: number | null;
    maxPoints: number | null;
    maxJoueurs: number | null;
  };
  backHref: string;
  allowEditMaxJoueurs: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    nom: category.nom,
    heureDebut: category.heureDebut,
    heureFin: category.heureFin ?? "",
    minPoints: category.minPoints?.toString() ?? "",
    maxPoints: category.maxPoints?.toString() ?? "",
    ...(allowEditMaxJoueurs ? { maxJoueurs: category.maxJoueurs?.toString() ?? "" } : {}),
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = allowEditMaxJoueurs ? form : { ...form, maxJoueurs: undefined };

    const response = await fetch(`/api/categories/${category.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <CategoryFormFields
        form={form}
        allowEditMaxJoueurs={allowEditMaxJoueurs}
        onChange={(field, value) => setForm((prev) => ({ ...prev, [field]: value }))}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          {loading ? "Mise à jour..." : "Enregistrer"}
        </button>
        <Link href={backHref} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground">
          Annuler
        </Link>
      </div>
    </form>
  );
}
