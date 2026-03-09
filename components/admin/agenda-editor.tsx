"use client";

import Script from "next/script";
import { X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { AgendaTour } from "@/lib/agenda";

type AgendaEditorProps = {
  initialTours: AgendaTour[];
};

type AgendaRow = AgendaTour & { localId: string };

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
            address_components?: Array<{ long_name?: string; types?: string[] }>;
          };
        };
      };
    };
  };
};

const getIsoDate = (value: string) => {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toISOString().slice(0, 10);
};

export function AgendaEditor({ initialTours }: AgendaEditorProps) {
  const [rows, setRows] = useState<AgendaRow[]>(() =>
    initialTours.map((tour, index) => ({
      ...tour,
      localId: `${tour.id}-${index}`,
    })),
  );
  const [mapsReady, setMapsReady] = useState(false);

  const venueInputRefs = useRef(new Map<string, HTMLInputElement>());
  const cityInputRefs = useRef(new Map<string, HTMLInputElement>());
  const addressInputRefs = useRef(new Map<string, HTMLInputElement>());
  const autocompleteReadyFor = useRef(new Set<string>());

  const mapsApiKey = useMemo(() => process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY, []);

  useEffect(() => {
    if (!mapsReady) return;

    const win = window as GoogleWindow;
    const AutocompleteCtor = win.google?.maps?.places?.Autocomplete;
    if (!AutocompleteCtor) return;

    rows.forEach((row) => {
      if (autocompleteReadyFor.current.has(row.localId)) return;

      const venueInput = venueInputRefs.current.get(row.localId);
      if (!venueInput) return;

      const autocomplete = new AutocompleteCtor(venueInput, {
        fields: ["name", "formatted_address", "address_components"],
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

        if (place.name) {
          venueInput.value = place.name;
        }

        const cityInput = cityInputRefs.current.get(row.localId);
        if (cityInput && resolvedCity) {
          cityInput.value = resolvedCity;
        }

        const addressInput = addressInputRefs.current.get(row.localId);
        if (addressInput && place.formatted_address) {
          addressInput.value = place.formatted_address;
        }
      });

      autocompleteReadyFor.current.add(row.localId);
    });
  }, [mapsReady, rows]);

  const addRow = () => {
    setRows((previous) => [
      ...previous,
      {
        id: previous.length + 1,
        label: `Tour ${previous.length + 1}`,
        date: "",
        club: "",
        city: "",
        venue: "",
        address: "",
        localId: `new-${Date.now()}-${Math.random()}`,
      },
    ]);
  };

  const removeRow = (localId: string) => {
    setRows((previous) => previous.filter((row) => row.localId !== localId));
    venueInputRefs.current.delete(localId);
    cityInputRefs.current.delete(localId);
    addressInputRefs.current.delete(localId);
    autocompleteReadyFor.current.delete(localId);
  };

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      {mapsApiKey ? (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}&libraries=places`}
          strategy="afterInteractive"
          onLoad={() => setMapsReady(true)}
        />
      ) : null}

      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-foreground">Tours de l&apos;agenda</h2>
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted"
        >
          <span aria-hidden="true">+</span>
          Ajouter un tour
        </button>
      </div>

      <div className="space-y-4">
        {rows.map((row, index) => (
          <article key={row.localId} className="rounded-xl border border-border/80 bg-muted/30 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-foreground">Tour #{index + 1}</p>
              <button
                type="button"
                onClick={() => removeRow(row.localId)}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" aria-hidden="true" />
                Supprimer
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <input type="hidden" name="id" value={index + 1} />
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Libellé</span>
                <input
                  name="label"
                  defaultValue={row.label}
                  required
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground"
                />
              </label>

              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Date</span>
                <input
                  type="date"
                  name="date"
                  defaultValue={getIsoDate(row.date)}
                  required
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground"
                />
              </label>

              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Club organisateur</span>
                <input
                  name="club"
                  defaultValue={row.club}
                  required
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground"
                />
              </label>

              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Ville</span>
                <input
                  name="city"
                  defaultValue={row.city}
                  required
                  ref={(node) => {
                    if (node) cityInputRefs.current.set(row.localId, node);
                    else cityInputRefs.current.delete(row.localId);
                  }}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground"
                />
              </label>

              <label className="space-y-1 text-sm sm:col-span-2">
                <span className="text-muted-foreground">Salle {mapsApiKey ? "(Google Maps)" : ""}</span>
                <input
                  name="venue"
                  defaultValue={row.venue}
                  required
                  ref={(node) => {
                    if (node) venueInputRefs.current.set(row.localId, node);
                    else venueInputRefs.current.delete(row.localId);
                  }}
                  placeholder={mapsApiKey ? "Commence à saisir pour rechercher un lieu" : ""}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground"
                />
              </label>

              <label className="space-y-1 text-sm sm:col-span-2">
                <span className="text-muted-foreground">Adresse</span>
                <input
                  name="address"
                  defaultValue={row.address}
                  required
                  ref={(node) => {
                    if (node) addressInputRefs.current.set(row.localId, node);
                    else addressInputRefs.current.delete(row.localId);
                  }}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground"
                />
              </label>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
