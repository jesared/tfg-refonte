"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

const STATUS_OPTIONS = [
  { value: "all", label: "Tous les statuts" },
  { value: "open", label: "Inscriptions ouvertes" },
  { value: "closed", label: "Inscriptions fermées" },
  { value: "past", label: "Tournois passés" },
  { value: "upcoming", label: "Tournois à venir" },
] as const;

function firstOrEmpty(value: string | null | undefined) {
  return value ?? "";
}

export function TournamentFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const basePath = pathname ?? "/admin/tournaments";
  const searchParams = useSearchParams();

  const initialValues = useMemo(() => {
    const params = searchParams ?? new URLSearchParams();

    return {
      q: firstOrEmpty(params.get("q")),
      status: firstOrEmpty(params.get("status")) || "all",
      tour: firstOrEmpty(params.get("tour")),
      from: firstOrEmpty(params.get("from")),
      to: firstOrEmpty(params.get("to")),
    };
  }, [searchParams]);

  const [q, setQ] = useState(initialValues.q);
  const [status, setStatus] = useState(initialValues.status);
  const [tour, setTour] = useState(initialValues.tour);
  const [from, setFrom] = useState(initialValues.from);
  const [to, setTo] = useState(initialValues.to);

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();

    if (q.trim()) {
      params.set("q", q.trim());
    }

    if (status && status !== "all") {
      params.set("status", status);
    }

    if (tour.trim()) {
      params.set("tour", tour.trim());
    }

    if (from) {
      params.set("from", from);
    }

    if (to) {
      params.set("to", to);
    }

    const query = params.toString();
    router.replace(query ? `${basePath}?${query}` : basePath);
  }

  function resetFilters() {
    setQ("");
    setStatus("all");
    setTour("");
    setFrom("");
    setTo("");
    router.replace(basePath);
  }

  return (
    <form className="mb-5 grid gap-3 md:grid-cols-5" onSubmit={applyFilters}>
      <label className="flex flex-col gap-1 text-xs text-muted-foreground">
        Recherche
        <input
          type="text"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Nom du tournoi"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs text-muted-foreground">
        Statut
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs text-muted-foreground">
        Tour
        <input
          type="number"
          min={1}
          value={tour}
          onChange={(event) => setTour(event.target.value)}
          placeholder="Ex: 3"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs text-muted-foreground">
        Date min
        <input
          type="date"
          value={from}
          onChange={(event) => setFrom(event.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs text-muted-foreground">
        Date max
        <input
          type="date"
          value={to}
          onChange={(event) => setTo(event.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
        />
      </label>

      <div className="md:col-span-5 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={resetFilters}
          className="inline-flex items-center rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
        >
          Réinitialiser
        </button>
        <button
          type="submit"
          className="inline-flex items-center rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          Appliquer
        </button>
      </div>
    </form>
  );
}
