"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { CategoryFormFields, CategoryFormValues } from "@/app/admin/categories/_components/CategoryFormFields";

type FormState = CategoryFormValues & {
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
      <CategoryFormFields
        form={form}
        allowEditMaxJoueurs
        onChange={(field, value) => setForm((prev) => ({ ...prev, [field]: value }))}
      />

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
