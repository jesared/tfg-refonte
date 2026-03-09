"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type FormState = {
  tour: string;
  date: string;
  clubOrganisateur: string;
  salleNom: string;
  salleAdresse: string;
  salleVille: string;
  salleLatitude: number | null;
  salleLongitude: number | null;
  sallePlaceId: string;
  inscriptionOuverte: boolean;
};

type GoogleWindow = Window & {
  google?: {
    maps?: {
      places?: {
        Autocomplete: new (
          inputField: HTMLInputElement,
          options?: Record<string, unknown>,
        ) => {
          addListener: (eventName: string, callback: () => void) => void;
          getPlace: () => {
            name?: string;
            formatted_address?: string;
            place_id?: string;
            geometry?: {
              location?: {
                lat: () => number;
                lng: () => number;
              };
            };
            address_components?: Array<{ long_name?: string; types?: string[] }>;
          };
        };
      };
    };
  };
};

const initialState: FormState = {
  tour: "",
  date: "",
  clubOrganisateur: "",
  salleNom: "",
  salleAdresse: "",
  salleVille: "",
  salleLatitude: null,
  salleLongitude: null,
  sallePlaceId: "",
  inscriptionOuverte: false,
};

export default function NewTournamentPage() {
  const router = useRouter();
  const mapsApiKey = useMemo(() => process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY, []);
  const salleNomRef = useRef<HTMLInputElement | null>(null);
  const [mapsReady, setMapsReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(initialState);

  useEffect(() => {
    if (!mapsReady || !salleNomRef.current) return;

    const win = window as GoogleWindow;
    const AutocompleteCtor = win.google?.maps?.places?.Autocomplete;
    if (!AutocompleteCtor) return;

    const autocomplete = new AutocompleteCtor(salleNomRef.current, {
      fields: ["name", "formatted_address", "address_components", "geometry", "place_id"],
      types: ["establishment"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      const resolvedCity =
        place.address_components?.find((component) => component.types?.includes("locality"))
          ?.long_name ??
        place.address_components?.find((component) =>
          component.types?.includes("administrative_area_level_2"),
        )?.long_name ??
        "";

      setForm((prev) => ({
        ...prev,
        salleNom: place.name ?? prev.salleNom,
        salleAdresse: place.formatted_address ?? prev.salleAdresse,
        salleVille: resolvedCity || prev.salleVille,
        sallePlaceId: place.place_id ?? "",
        salleLatitude: place.geometry?.location?.lat() ?? null,
        salleLongitude: place.geometry?.location?.lng() ?? null,
      }));
    });
  }, [mapsReady]);

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
      {mapsApiKey ? (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}&libraries=places`}
          strategy="afterInteractive"
          onLoad={() => setMapsReady(true)}
        />
      ) : null}

      <h1 className="text-xl font-bold mb-4">Créer un tournoi</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
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
          ref={salleNomRef}
          name="salleNom"
          placeholder={mapsApiKey ? "Commence à saisir pour rechercher un lieu" : "Nom de la salle"}
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
