"use client";

import { Check, Pencil, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { InlineActionForm } from "./inline-action-form";

type RegistrationActionMenuProps = {
  registrationId: string;
  playerName: string;
  canValidate: boolean;
  canReset: boolean;
  isCheckedIn: boolean;
  validateRegistration: (formData: FormData) => void | Promise<void>;
  resetRegistration: (formData: FormData) => void | Promise<void>;
  checkInRegistration: (formData: FormData) => void | Promise<void>;
  resetCheckInRegistration: (formData: FormData) => void | Promise<void>;
  deleteRegistration: (formData: FormData) => void | Promise<void>;
  editPopoverTarget: string;
};

const actionClassName =
  "inline-flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground";

export function RegistrationActionMenu({
  registrationId,
  playerName,
  canValidate,
  canReset,
  isCheckedIn,
  validateRegistration,
  resetRegistration,
  checkInRegistration,
  resetCheckInRegistration,
  deleteRegistration,
  editPopoverTarget,
}: RegistrationActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
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

  const closeMenu = () => setIsOpen(false);

  return (
    <div ref={menuRef} className="relative inline-flex">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Ouvrir le menu des actions"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <span className="text-base leading-none" aria-hidden="true">⋮</span>
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full z-10 mt-2 flex w-44 flex-col rounded-xl border border-border bg-popover p-1.5 shadow-lg"
        >
          {canValidate && (
            <form action={validateRegistration}>
              <input type="hidden" name="registrationId" value={registrationId} />
              <button type="submit" className={actionClassName} onClick={closeMenu}>
                <Check className="h-3.5 w-3.5" aria-hidden="true" /> Valider
              </button>
            </form>
          )}
          {canReset && (
            <form action={resetRegistration}>
              <input type="hidden" name="registrationId" value={registrationId} />
              <button type="submit" className={actionClassName} onClick={closeMenu}>
                <Check className="h-3.5 w-3.5" aria-hidden="true" /> Remettre
              </button>
            </form>
          )}
          {!isCheckedIn ? (
            <form action={checkInRegistration}>
              <input type="hidden" name="registrationId" value={registrationId} />
              <button type="submit" className={actionClassName} onClick={closeMenu}>
                <Check className="h-3.5 w-3.5" aria-hidden="true" /> Présent
              </button>
            </form>
          ) : (
            <form action={resetCheckInRegistration}>
              <input type="hidden" name="registrationId" value={registrationId} />
              <button type="submit" className={actionClassName} onClick={closeMenu}>
                <X className="h-3.5 w-3.5" aria-hidden="true" /> Absent
              </button>
            </form>
          )}

          <button
            type="button"
            popoverTarget={editPopoverTarget}
            className={actionClassName}
            onClick={closeMenu}
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Modifier
          </button>

          <div className="my-1 h-px bg-border" />

          <InlineActionForm
            action={deleteRegistration}
            registrationId={registrationId}
            confirmMessage={`Confirmer la suppression de ${playerName} ?`}
          >
            <button
              type="submit"
              className={`${actionClassName} text-destructive hover:bg-destructive/10 hover:text-destructive`}
              onClick={closeMenu}
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" /> Supprimer
            </button>
          </InlineActionForm>
        </div>
      )}
    </div>
  );
}
