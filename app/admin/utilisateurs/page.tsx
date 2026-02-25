import { Check, ShieldCheck, User, UserCircle2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - Utilisateurs",
  description: "Gestion des rôles et accès de l'administration.",
};

const users = [
  { name: "Camille Martin", role: "Admin", status: "Actif" },
  { name: "Léo Bernard", role: "Arbitre", status: "En attente" },
  { name: "Sarah Petit", role: "Gestionnaire", status: "Actif" },
  { name: "Nina Robert", role: "Lecture", status: "Suspendu" },
];

export default function AdminUsersPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <header className="rounded-2xl border border-border bg-card px-6 py-7 shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <User className="h-4 w-4" aria-hidden="true" />
          Administration
        </div>
        <h1 className="mt-4 text-3xl font-semibold text-foreground">Utilisateurs</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Gérez les droits d&apos;accès et surveillez les comptes nécessitant une action.
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
          <UserCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
          Comptes du back-office
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="px-3 py-2 font-medium">Nom</th>
                <th className="px-3 py-2 font-medium">Rôle</th>
                <th className="px-3 py-2 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.name} className="border-b border-border/60 last:border-0">
                  <td className="px-3 py-3 font-medium text-foreground">{user.name}</td>
                  <td className="px-3 py-3 text-foreground/90">{user.role}</td>
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-foreground/90">
                      {user.status === "Actif" ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
                      ) : (
                        <ShieldCheck className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
                      )}
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
