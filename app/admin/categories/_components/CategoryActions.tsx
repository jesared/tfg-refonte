"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function CategoryActions({
  categoryId,
  categoryName,
}: {
  categoryId: string;
  categoryName: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Supprimer la catégorie “${categoryName}” pour tous les tours ? Cette action est irréversible.`,
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError(null);

    const response = await fetch(`/api/categories/${categoryId}`, { method: "DELETE" });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "Impossible de supprimer la catégorie.");
      setLoading(false);
      return;
    }

    router.refresh();
    setLoading(false);
  }

  async function handleDuplicate() {
    const duplicatedName = window.prompt("Nom de la nouvelle catégorie", `${categoryName} (copie)`);

    if (duplicatedName === null) {
      return;
    }

    setLoading(true);
    setError(null);

    const response = await fetch(`/api/categories/${categoryId}/duplicate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom: duplicatedName }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "Impossible de dupliquer la catégorie.");
      setLoading(false);
      return;
    }

    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button asChild variant="outline" size="sm" className="h-8 px-2 text-xs">
          <Link href={`/admin/categories/${categoryId}/edit`}>Modifier</Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={handleDuplicate}
          className="h-8 px-2 text-xs"
        >
          {loading ? "Duplication..." : "Dupliquer"}
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={loading}
          onClick={handleDelete}
          className="h-8 px-2 text-xs"
        >
          {loading ? "Suppression..." : "Supprimer"}
        </Button>
      </div>
      {error && <p className="max-w-64 text-right text-xs text-red-600">{error}</p>}
    </div>
  );
}
