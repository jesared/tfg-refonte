interface RegistrationCountCellProps {
  registeredPlayers: number;
  maxPlayers: number | null;
}

export function RegistrationCountCell({
  registeredPlayers,
  maxPlayers,
}: RegistrationCountCellProps) {
  const isLimited = maxPlayers !== null;
  const isFull = isLimited && registeredPlayers >= maxPlayers;

  return (
    <span
      className={`inline-flex min-w-20 items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${
        isFull
          ? "bg-rose-500/10 text-rose-700 dark:text-rose-300"
          : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      }`}
      aria-label={
        isLimited
          ? `${registeredPlayers} inscriptions sur ${maxPlayers}`
          : `${registeredPlayers} inscriptions, sans limite`
      }
    >
      {isLimited ? `${registeredPlayers}/${maxPlayers}` : `${registeredPlayers}/∞`}
    </span>
  );
}
