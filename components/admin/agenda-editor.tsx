"use client";

import { X } from "lucide-react";
import { useState } from "react";

import type { AgendaTour } from "@/lib/agenda";

type AgendaEditorProps = {
  initialTours: AgendaTour[];
};

type AgendaRow = AgendaTour & { localId: string };

export function AgendaEditor({ initialTours }: AgendaEditorProps) {
  const [rows, setRows] = useState<AgendaRow[]>(() =>
    initialTours.map((tour, index) => ({
      ...tour,
      localId: `${tour.id}-${index}`,
    })),
  );

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
  };

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
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
                  name="date"
                  defaultValue={row.date}
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
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground"
                />
              </label>

              <label className="space-y-1 text-sm sm:col-span-2">
                <span className="text-muted-foreground">Salle</span>
                <input
                  name="venue"
                  defaultValue={row.venue}
                  required
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground"
                />
              </label>

              <label className="space-y-1 text-sm sm:col-span-2">
                <span className="text-muted-foreground">Adresse</span>
                <input
                  name="address"
                  defaultValue={row.address}
                  required
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
