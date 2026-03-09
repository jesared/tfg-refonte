"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type FormState = {
  nom: string;
  tour: string;
  date: string;
  clubOrganisateur: string;
  salleNom: string;
  salleAdresse: string;
  salleVille: string;
  inscriptionOuverte: boolean;
};

const initialState: FormState = {
  nom: "",
  tour: "",
  date: "",
  clubOrganisateur: "",
  salleNom: "",
  salleAdresse: "",
  salleVille: "",
  inscriptionOuverte: false,
};

export default function NewTournamentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(initialState);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/tournaments", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        tour: Number(form.tour),
      }),
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "Impossible de créer le tournoi.");
      setLoading(false);
      return;
    }

    router.push("/admin/tournaments");
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-xl font-bold mb-4">Créer un tournoi</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="nom"
          placeholder="Nom"
          required
          value={form.nom}
          onChange={(e) => setForm((prev) => ({ ...prev, nom: e.target.value }))}
          className="w-full border p-2 rounded"
        />
        <input
          type="number"
          name="tour"
          placeholder="Tour (ex: 1)"
          min={1}
          required
          value={form.tour}
          onChange={(e) => setForm((prev) => ({ ...prev, tour: e.target.value }))}
          className="w-full border p-2 rounded"
        />
        <input
          type="date"
          name="date"
          required
          value={form.date}
          onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
          className="w-full border p-2 rounded"
        />
        <input
          name="clubOrganisateur"
          placeholder="Club organisateur"
          required
          value={form.clubOrganisateur}
          onChange={(e) => setForm((prev) => ({ ...prev, clubOrganisateur: e.target.value }))}
          className="w-full border p-2 rounded"
        />
        <input
          name="salleNom"
          placeholder="Nom de la salle"
          required
          value={form.salleNom}
          onChange={(e) => setForm((prev) => ({ ...prev, salleNom: e.target.value }))}
          className="w-full border p-2 rounded"
        />
        <input
          name="salleAdresse"
          placeholder="Adresse de la salle"
          required
          value={form.salleAdresse}
          onChange={(e) => setForm((prev) => ({ ...prev, salleAdresse: e.target.value }))}
          className="w-full border p-2 rounded"
        />
        <input
          name="salleVille"
          placeholder="Ville"
          required
          value={form.salleVille}
          onChange={(e) => setForm((prev) => ({ ...prev, salleVille: e.target.value }))}
          className="w-full border p-2 rounded"
        />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.inscriptionOuverte}
            onChange={(e) => setForm((prev) => ({ ...prev, inscriptionOuverte: e.target.checked }))}
          />
          Inscriptions ouvertes
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

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
