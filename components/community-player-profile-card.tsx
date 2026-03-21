import { Check, Trophy } from "lucide-react";

type CommunityPlayerProfileCardProps = {
  playerName: string;
  grade: string;
  club?: string | null;
  zone?: string | null;
  wins: number;
  hasTripleCrown: boolean;
};

export function CommunityPlayerProfileCard({
  playerName,
  grade,
  club,
  zone,
  wins,
  hasTripleCrown,
}: CommunityPlayerProfileCardProps) {
  return (
    <article className="flex min-h-44 flex-col justify-between rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">{playerName}</p>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Profil joueur</p>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full border border-primary px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
        >
          Suivre
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
          Grade: {grade}
        </span>
        {club ? (
          <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
            Club: {club}
          </span>
        ) : null}
        {zone ? (
          <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
            Zone: {zone}
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">Tournois gagnés: {wins}</p>
        {hasTripleCrown ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-700">
            <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
            Triple Couronne
          </span>
        ) : null}
      </div>
    </article>
  );
}
