"use client";

import { X } from "lucide-react";
import { useMemo, useState } from "react";

import type { Tableau } from "@/lib/tableaux";

type Props = {
  initialTableaux: Tableau[];
};

type Row = {
  uid: string;
  id: number;
  title: string;
  points: string;
  start: string;
};

const toRow = (tableau: Tableau, index: number): Row => ({
  uid: `${tableau.id}-${index}`,
  id: tableau.id,
  title: tableau.title,
  points: tableau.points,
  start: tableau.start,
});

export function TableauxEditor({ initialTableaux }: Props) {
  const [rows, setRows] = useState<Row[]>(() => initialTableaux.map(toRow));

  const nextId = useMemo(() => {
    const max = rows.reduce((acc, row) => Math.max(acc, row.id), 0);
    return max + 1;
  }, [rows]);

  const addRow = () => {
    setRows((current) => [
      ...current,
      {
        uid: `new-${Date.now()}`,
        id: nextId,
        title: `Tableau ${nextId}`,
        points: "",
        start: "",
      },
    ]);
  };

  const removeRow = (uid: string) => {
    setRows((current) => current.filter((row) => row.uid !== uid));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Tableaux</h2>
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted"
        >
          Ajouter un tableau
        </button>
      </div>

      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.uid} className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-card p-4 md:grid-cols-[90px_1fr_1fr_140px_auto] md:items-center">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">ID</label>
              <input
                name="id"
                value={row.id}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  setRows((current) =>
                    current.map((item) =>
                      item.uid === row.uid ? { ...item, id: Number.isFinite(value) ? value : item.id } : item,
                    ),
                  );
                }}
                required
                type="number"
                min={1}
                className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Nom</label>
              <input
                name="title"
                value={row.title}
                onChange={(event) => {
                  const value = event.target.value;
                  setRows((current) =>
                    current.map((item) => (item.uid === row.uid ? { ...item, title: value } : item)),
                  );
                }}
                required
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Plage de points</label>
              <input
                name="points"
                value={row.points}
                onChange={(event) => {
                  const value = event.target.value;
                  setRows((current) =>
                    current.map((item) => (item.uid === row.uid ? { ...item, points: value } : item)),
                  );
                }}
                required
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Début</label>
              <input
                name="start"
                value={row.start}
                onChange={(event) => {
                  const value = event.target.value;
                  setRows((current) =>
                    current.map((item) => (item.uid === row.uid ? { ...item, start: value } : item)),
                  );
                }}
                required
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm"
              />
            </div>

            <button
              type="button"
              onClick={() => removeRow(row.uid)}
              className="inline-flex items-center justify-center rounded-md border border-red-300 px-2 py-2 text-red-600 hover:bg-red-50"
              aria-label={`Supprimer ${row.title || `tableau ${row.id}`}`}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
