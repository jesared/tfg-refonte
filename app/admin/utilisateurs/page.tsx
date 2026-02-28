import { ShieldCheck, User, UserCircle2 } from "lucide-react";
import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export const metadata: Metadata = {
  title: "Admin - Utilisateurs",
  description: "Gestion des rôles et accès de l'administration.",
};

const allowedRoles = ["USER", "ADMIN"] as const;

type AllowedRole = (typeof allowedRoles)[number];

async function updateUserRole(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const userId = String(formData.get("userId") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim() as AllowedRole;

  if (!userId || !allowedRoles.includes(role)) {
    redirect("/admin/utilisateurs?updated=0&reason=invalid");
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!targetUser) {
    redirect("/admin/utilisateurs?updated=0&reason=not-found");
  }

  if (targetUser.id === session.user.id && role !== "ADMIN") {
    redirect("/admin/utilisateurs?updated=0&reason=self");
  }

  if (targetUser.role === "ADMIN" && role === "USER") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });

    if (adminCount <= 1) {
      redirect("/admin/utilisateurs?updated=0&reason=last-admin");
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  revalidatePath("/admin/utilisateurs");
  redirect("/admin/utilisateurs?updated=1");
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: Promise<{ updated?: string; reason?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const users = await prisma.user.findMany({
    orderBy: [{ role: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
    },
  });

  const params = await searchParams;
  const isUpdated = params?.updated === "1";
  const hasError = params?.updated === "0";

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <header className="rounded-2xl border border-border bg-card px-6 py-7 shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <User className="h-4 w-4" aria-hidden="true" />
          Administration
        </div>
        <h1 className="mt-4 text-3xl font-semibold text-foreground">Utilisateurs</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Gérez les droits d&apos;accès avec les comptes réels de la base de données.
        </p>
      </header>

      {isUpdated && (
        <p className="rounded-xl border border-emerald-300/60 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-500/10 dark:text-emerald-200">
          ✅ Rôle utilisateur mis à jour.
        </p>
      )}

      {hasError && (
        <p className="rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-200">
          ⚠️ Mise à jour refusée ({params?.reason ?? "inconnue"}). Vérifiez les droits ou la
          cohérence des données.
        </p>
      )}

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
          <UserCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
          Comptes du back-office
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="px-3 py-2 font-medium">Utilisateur</th>
                <th className="px-3 py-2 font-medium">Email</th>
                <th className="px-3 py-2 font-medium">Rôle</th>
                <th className="px-3 py-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isCurrentUser = user.id === session.user.id;

                return (
                  <tr key={user.id} className="border-b border-border/60 last:border-0">
                    <td className="px-3 py-3 font-medium text-foreground">
                      {user.name || "Utilisateur sans nom"}
                      {isCurrentUser && (
                        <span className="ml-2 rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          Vous
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-foreground/90">{user.email || "-"}</td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-foreground/90">
                        {user.role === "ADMIN" ? (
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
                        ) : (
                          <User className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
                        )}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <form action={updateUserRole} className="flex items-center gap-2">
                        <input type="hidden" name="userId" value={user.id} />
                        <select
                          name="role"
                          defaultValue={user.role}
                          className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground"
                        >
                          <option value="USER">USER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                        <button
                          type="submit"
                          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
                        >
                          Enregistrer
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Propositions pour la suite</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>Historiser chaque changement de rôle (qui, quoi, quand) pour un audit clair.</li>
          <li>Ajouter des rôles intermédiaires (ex: MODERATOR, EDITOR) avec permissions fines.</li>
          <li>Permettre des invitations d&apos;admin par email avec expiration automatique.</li>
        </ul>
      </section>
    </main>
  );
}
