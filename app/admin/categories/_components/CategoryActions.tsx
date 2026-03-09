"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-3">
        <Link href={`/admin/categories/${categoryId}/edit`} className="text-xs text-blue-600">
          Modifier
        </Link>
        <button
          type="button"
          disabled={loading}
          onClick={handleDelete}
          className="text-xs text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Suppression..." : "Supprimer"}
        </button>
      </div>
      {error && <p className="max-w-64 text-right text-xs text-red-600">{error}</p>}
    </div>
  );
}
