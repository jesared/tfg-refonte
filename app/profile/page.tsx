import { Mail, ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";

import { authOptions } from "@/pages/api/auth/[...nextauth]";

function getUserInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "U";
  const parts = source.split(/[\s@._-]+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <section className="mx-auto flex w-full max-w-2xl flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-foreground">Profil</h1>
        <p className="text-sm text-muted-foreground">
          Vous devez être connecté avec Google pour consulter votre profil.
        </p>
        <Link
          href="/"
          className="inline-flex w-fit items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Retour à l&apos;accueil
        </Link>
      </section>
    );
  }

  const { user } = session;
  const avatarInitials = getUserInitials(user.name, user.email);

  return (
    <section className="mx-auto w-full max-w-3xl rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt={`Avatar de ${user.name ?? user.email ?? "l'utilisateur"}`}
            className="h-24 w-24 rounded-full border border-border object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full border border-border bg-muted text-2xl font-semibold text-foreground">
            {avatarInitials}
          </div>
        )}

        <div className="space-y-1">
          <h1 className="text-3xl font-semibold text-foreground">Mon profil</h1>
          <p className="text-sm text-muted-foreground">
            Retrouvez ici les informations liées à votre compte de connexion.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <article className="rounded-xl border border-border bg-background/70 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
            <UserRound className="h-4 w-4 text-primary" />
            Nom d&apos;affichage
          </div>
          <p className="text-sm text-muted-foreground">{user.name ?? "Non renseigné"}</p>
        </article>

        <article className="rounded-xl border border-border bg-background/70 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Mail className="h-4 w-4 text-primary" />
            Email
          </div>
          <p className="text-sm text-muted-foreground">{user.email ?? "Non renseigné"}</p>
        </article>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-muted/40 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Sécurité
        </div>
        <p className="text-sm text-muted-foreground">
          L&apos;authentification est gérée via Google et sécurisée par NextAuth.
        </p>
      </div>
    </section>
  );
}
