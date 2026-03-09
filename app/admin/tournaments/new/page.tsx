"use client";

import Script from "next/script";
import Link from "next/link";
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
  const autocompleteInitializedRef = useRef(false);
  const [mapsReady, setMapsReady] = useState(
    () =>
      typeof window !== "undefined" &&
      Boolean((window as GoogleWindow).google?.maps?.places?.Autocomplete),
  );
  const [mapsFailed, setMapsFailed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(initialState);

  useEffect(() => {
    if (!mapsApiKey || !mapsReady || !salleNomRef.current || autocompleteInitializedRef.current) {
      return;
    }

    const win = window as GoogleWindow;
    const AutocompleteCtor = win.google?.maps?.places?.Autocomplete;
    if (!AutocompleteCtor) return;

    const autocomplete = new AutocompleteCtor(salleNomRef.current, {
      fields: ["name", "formatted_address", "address_components", "geometry", "place_id"],
    });
    autocompleteInitializedRef.current = true;

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
  }, [mapsReady, mapsApiKey]);

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
    <div className="mx-auto max-w-3xl p-8 text-foreground">
      {mapsApiKey ? (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}&libraries=places`}
          strategy="afterInteractive"
          onLoad={() => setMapsReady(true)}
          onError={() => setMapsFailed(true)}
        />
      ) : null}

      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Créer un tournoi</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Renseignez les informations générales puis le lieu.
          </p>
        </div>
        <Link
          href="/admin/tournaments"
          className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
        >
          Retour à la liste
        </Link>
      </div>

      {!mapsApiKey || mapsFailed ? (
        <p className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
          La recherche Google Places est indisponible. Vous pouvez saisir le lieu manuellement.
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="space-y-4 rounded-lg border border-border p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Informations générales
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span>Tour</span>
              <input
                type="number"
                name="tour"
                placeholder="Ex: 1"
                min={1}
                required
                value={form.tour}
                onChange={(e) => setForm((prev) => ({ ...prev, tour: e.target.value }))}
                className="w-full rounded-md border border-border bg-background p-2"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span>Date</span>
              <input
                type="date"
                name="date"
                required
                value={form.date}
                onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                className="w-full rounded-md border border-border bg-background p-2"
              />
            </label>
          </div>
          <label className="block space-y-1 text-sm">
            <span>Club organisateur</span>
            <input
              name="clubOrganisateur"
              placeholder="Nom du club"
              required
              value={form.clubOrganisateur}
              onChange={(e) => setForm((prev) => ({ ...prev, clubOrganisateur: e.target.value }))}
              className="w-full rounded-md border border-border bg-background p-2"
            />
          </label>
        </section>

        <section className="space-y-4 rounded-lg border border-border p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Lieu
          </h2>
          <label className="block space-y-1 text-sm">
            <span>Nom de la salle</span>
            <input
              ref={salleNomRef}
              name="salleNom"
              placeholder={
                mapsApiKey ? "Commencez à saisir pour rechercher un lieu" : "Nom de la salle"
              }
              required
              value={form.salleNom}
              onChange={(e) => setForm((prev) => ({ ...prev, salleNom: e.target.value }))}
              className="w-full rounded-md border border-border bg-background p-2"
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span>Adresse</span>
            <input
              name="salleAdresse"
              placeholder="Adresse de la salle"
              required
              value={form.salleAdresse}
              onChange={(e) => setForm((prev) => ({ ...prev, salleAdresse: e.target.value }))}
              className="w-full rounded-md border border-border bg-background p-2"
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span>Ville</span>
            <input
              name="salleVille"
              placeholder="Ville"
              required
              value={form.salleVille}
              onChange={(e) => setForm((prev) => ({ ...prev, salleVille: e.target.value }))}
              className="w-full rounded-md border border-border bg-background p-2"
            />
          </label>
        </section>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.inscriptionOuverte}
            onChange={(e) => setForm((prev) => ({ ...prev, inscriptionOuverte: e.target.checked }))}
          />
          Inscriptions ouvertes (décochez pour laisser le tournoi en préparation)
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Création..." : "Créer"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/tournaments")}
            className="rounded-md border border-border px-4 py-2"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
