"use client";

import { Check, Pencil, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type TournamentActionMenuProps = {
  tournamentId: string;
  tournamentName: string;
  deleteTournament: (formData: FormData) => void | Promise<void>;
};

const actionClassName =
  "inline-flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground";

export function TournamentActionMenu({
  tournamentId,
  tournamentName,
  deleteTournament,
}: TournamentActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setIsOpen(false);
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative inline-flex">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Ouvrir le menu des actions"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <span className="text-base leading-none" aria-hidden="true">
          ⋮
        </span>
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full z-10 mt-2 flex min-w-40 flex-col rounded-md border border-border bg-popover p-1.5 shadow-lg"
        >
          <Link
            href="/admin/inscriptions"
            className={actionClassName}
            onClick={() => setIsOpen(false)}
          >
            <Check className="h-3.5 w-3.5" aria-hidden="true" /> Gérer
          </Link>
          <Link
            href={`/admin/tournaments/${tournamentId}/edit`}
            className={actionClassName}
            onClick={() => setIsOpen(false)}
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Modifier
          </Link>

          <div className="my-1 h-px bg-border" />

          <form
            action={deleteTournament}
            onSubmit={(event) => {
              if (!window.confirm(`Confirmer la suppression de ${tournamentName} ?`)) {
                event.preventDefault();
                return;
              }
              setIsOpen(false);
            }}
          >
            <input type="hidden" name="tournamentId" value={tournamentId} />
            <button
              type="submit"
              className={`${actionClassName} text-destructive hover:bg-destructive/10 hover:text-destructive`}
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" /> Supprimer
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
