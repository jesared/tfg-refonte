"use client";

import { useState } from "react";

export default function InscriptionPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData(e.currentTarget);

    const res = await fetch("/api/registration", {
      method: "POST",
      body: JSON.stringify({
        nom: formData.get("nom"),
        prenom: formData.get("prenom"),
        numeroLicence: formData.get("numeroLicence"),
        genre: formData.get("genre"),
        club: formData.get("club"),
        points: Number(formData.get("points")),
        tableau: formData.get("tableau"),
      }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("Inscription enregistrée avec succès.");
      e.currentTarget.reset();
    } else {
      setMessage(data.error || "Erreur lors de l'inscription.");
    }

    setLoading(false);
  }

  return (
    <div className="max-w-xl mx-auto py-12">
      <h1 className="text-2xl font-bold mb-6">Inscription au tournoi</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="nom" placeholder="Nom" required className="w-full border p-2 rounded" />
        <input name="prenom" placeholder="Prénom" required className="w-full border p-2 rounded" />
        <input
          name="numeroLicence"
          placeholder="Numéro licence"
          required
          className="w-full border p-2 rounded"
        />

        <select name="genre" className="w-full border p-2 rounded">
          <option value="">Genre</option>
          <option value="M">Masculin</option>
          <option value="F">Féminin</option>
        </select>

        <input name="club" placeholder="Club" required className="w-full border p-2 rounded" />
        <input
          name="points"
          type="number"
          placeholder="Points FFTT"
          required
          className="w-full border p-2 rounded"
        />

        <select name="tableau" required className="w-full border p-2 rounded">
          <option value="">Choisir un tableau</option>
          <option value="0-899">0-899</option>
          <option value="900-1299">900-1299</option>
          <option value="1300-1599">1300-1599</option>
          <option value="1600+">1600+</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          {loading ? "Envoi..." : "S'inscrire"}
        </button>

        {message && <p className="text-center mt-4">{message}</p>}
      </form>
    </div>
  );
}
