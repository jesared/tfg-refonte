import type { Session } from "next-auth";

export function hasAuthenticatedUser(session: Session | null): session is Session & { user: { id: string; role: "USER" | "ADMIN" } } {
  return Boolean(session?.user?.id && session.user.role);
}

export function canManageCommunityReports(session: Session | null): boolean {
  return hasAuthenticatedUser(session) && session.user.role === "ADMIN";
}

export function canDeleteCommunityPost(session: Session | null, authorId: string): boolean {
  return hasAuthenticatedUser(session) && (session.user.role === "ADMIN" || session.user.id === authorId);
}

export function canDeleteCommunityComment(session: Session | null, authorId: string): boolean {
  return hasAuthenticatedUser(session) && (session.user.role === "ADMIN" || session.user.id === authorId);
}
