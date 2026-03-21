export type ActivityEventType = "REGISTRATION" | "VICTORY" | "GRADE_CHANGE";

export type ActivityEventPayload = {
  playerName: string;
  type: ActivityEventType;
  tournamentName?: string;
  previousGrade?: string;
  newGrade?: string;
  createdAt?: Date;
};

const formatDateTime = (date?: Date) => {
  if (!date) {
    return null;
  }

  return new Date(date).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const generateActivitySentence = (event: ActivityEventPayload) => {
  const prefix = formatDateTime(event.createdAt);

  let sentence = "";
  switch (event.type) {
    case "REGISTRATION":
      sentence = `${event.playerName} s'est inscrit${
        event.tournamentName ? ` au tournoi ${event.tournamentName}` : " à un tournoi"
      }.`;
      break;
    case "VICTORY":
      sentence = `${event.playerName} remporte${
        event.tournamentName ? ` ${event.tournamentName}` : " un tournoi"
      }.`;
      break;
    case "GRADE_CHANGE":
      sentence = `${event.playerName} passe de ${event.previousGrade ?? "son grade précédent"} à ${
        event.newGrade ?? "un nouveau grade"
      }.`;
      break;
    default:
      sentence = `${event.playerName} a réalisé une nouvelle performance.`;
      break;
  }

  return prefix ? `${prefix} · ${sentence}` : sentence;
};

export const hasTripleCrownBadge = (wonTournaments: number) => wonTournaments >= 3;
