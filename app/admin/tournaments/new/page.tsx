"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewTournamentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    await fetch("/api/tournaments", {
      method: "POST",
      body: JSON.stringify({
        nom: formData.get("nom"),
        dateDebut: formData.get("dateDebut"),
        dateFin: formData.get("dateFin"),
      }),
      headers: { "Content-Type": "application/json" },
    });

    router.push("/admin/tournaments");
  }

  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-xl font-bold mb-4">Créer un tournoi</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="nom" placeholder="Nom" required className="w-full border p-2 rounded" />
        <input type="date" name="dateDebut" required className="w-full border p-2 rounded" />
        <input type="date" name="dateFin" required className="w-full border p-2 rounded" />

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Création..." : "Créer"}
        </button>
      </form>
    </div>
  );
}
