"use client";

import { CommunityPostScope } from "@prisma/client";
import { TableTennis } from "lucide-react";
import { useState } from "react";

type TournamentOption = {
  id: string;
  nom: string;
  tour: number;
};

type CommunityPostComposerProps = {
  action: (formData: FormData) => Promise<void>;
  tournaments: TournamentOption[];
};

export function CommunityPostComposer({ action, tournaments }: CommunityPostComposerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="rounded-2xl border border-border bg-background/80 p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
            <TableTennis className="h-5 w-5" aria-hidden="true" />
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="h-11 flex-1 rounded-full border border-input bg-muted/70 px-4 text-left text-sm text-muted-foreground transition hover:bg-muted"
          >
            Quoi de neuf au club ou sur les tours ?
          </button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Votre publication sera enregistrée en brouillon puis validée par un administrateur.
        </p>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-4 shadow-xl sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-foreground sm:text-lg">
                  Nouvelle publication communauté
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Partagez résultats, annonces club et actualités tennis de table.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md border border-input px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted"
              >
                Fermer
              </button>
            </div>

            <form action={action} className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 sm:col-span-2">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Titre (optionnel)
                </span>
                <input
                  type="text"
                  name="title"
                  maxLength={140}
                  placeholder="Ex: Résultats du tour 2 à Reims"
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                />
              </label>

              <label className="flex flex-col gap-1 sm:col-span-2">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Contenu
                </span>
                <textarea
                  name="content"
                  required
                  minLength={12}
                  maxLength={2000}
                  rows={5}
                  placeholder="Partagez une annonce, un résultat ou une info utile à la communauté."
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Type
                </span>
                <select
                  name="scope"
                  defaultValue={CommunityPostScope.TOURNAMENT}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value={CommunityPostScope.TOURNAMENT}>Tournoi</option>
                  <option value={CommunityPostScope.CLUB}>Club</option>
                  <option value={CommunityPostScope.GENERAL}>Général</option>
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  URL de l&apos;image (optionnel)
                </span>
                <input
                  type="url"
                  name="imageUrl"
                  maxLength={1000}
                  placeholder="https://exemple.com/photo-tournoi.jpg"
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                />
              </label>

              <label className="flex flex-col gap-1 sm:col-span-2">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Tournoi lié (optionnel)
                </span>
                <select
                  name="tournamentId"
                  defaultValue=""
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Aucun tournoi spécifique</option>
                  {tournaments.map((tournament) => (
                    <option key={tournament.id} value={tournament.id}>
                      Tour {tournament.tour} · {tournament.nom}
                    </option>
                  ))}
                </select>
              </label>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                >
                  Envoyer pour validation
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
