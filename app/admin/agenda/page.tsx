import { CalendarDays, Check, X } from "lucide-react";
import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { AgendaEditor } from "@/components/admin/agenda-editor";
import { getAgendaTours, saveAgendaTours } from "@/lib/agenda";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export const metadata: Metadata = {
  title: "Admin - Agenda & salles",
  description: "Gestion de la page agenda et salles côté administration.",
};

async function updateAgenda(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const ids = formData.getAll("id");
  const labels = formData.getAll("label");
  const dates = formData.getAll("date");
  const clubs = formData.getAll("club");
  const cities = formData.getAll("city");
  const venues = formData.getAll("venue");
  const addresses = formData.getAll("address");

  const tours = ids
    .map((id, index) => ({
      id: Number(id),
      label: String(labels[index] ?? "").trim(),
      date: String(dates[index] ?? "").trim(),
      club: String(clubs[index] ?? "").trim(),
      city: String(cities[index] ?? "").trim(),
      venue: String(venues[index] ?? "").trim(),
      address: String(addresses[index] ?? "").trim(),
    }))
    .filter(
      (item) => item.label && item.date && item.club && item.city && item.venue && item.address,
    );

  if (tours.length === 0) {
    redirect("/admin/agenda?error=1");
  }

  let result: Awaited<ReturnType<typeof saveAgendaTours>>;

  try {
    result = await saveAgendaTours(tours);
  } catch {
    redirect("/admin/agenda?error=1");
  }

  revalidatePath("/agenda");
  revalidatePath("/salles");
  revalidatePath("/admin/agenda");

  redirect(`/admin/agenda?updated=1${result.usedTemporaryStorage ? "&storage=tmp" : ""}`);
}

export default async function AdminAgendaPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const tours = await getAgendaTours();
  const params = await searchParams;

  const updatedParam = typeof params?.updated === "string" ? params.updated : undefined;
  const storageParam = typeof params?.storage === "string" ? params.storage : undefined;
  const errorParam = typeof params?.error === "string" ? params.error : undefined;

  const isUpdated = updatedParam === "1";
  const usedTemporaryStorage = storageParam === "tmp";

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <header className="rounded-2xl border border-border/70 bg-card/80 px-5 py-6 shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          Administration
        </div>
        <h1 className="mt-3 text-2xl font-semibold text-foreground">Gestion agenda &amp; salles</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Modifie les tours, dates, clubs et adresses affichés sur la page publique.
        </p>
      </header>

      {errorParam === "1" && (
        <p className="inline-flex items-center gap-2 rounded-xl border border-red-300/60 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-400/40 dark:bg-red-500/10 dark:text-red-200">
          <X className="h-4 w-4" aria-hidden="true" />
          Erreur serveur lors de l&apos;enregistrement. Vérifie les champs puis réessaie.
        </p>
      )}

      {isUpdated && (
        <p className="inline-flex items-center gap-2 rounded-xl border border-emerald-300/60 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-500/10 dark:text-emerald-200">
          <Check className="h-4 w-4" aria-hidden="true" />
          Agenda &amp; salles mis à jour.
        </p>
      )}

      {isUpdated && usedTemporaryStorage && (
        <p className="inline-flex items-center gap-2 rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-200">
          <X className="h-4 w-4" aria-hidden="true" />
          Stockage temporaire utilisé (système de fichiers en lecture seule).
        </p>
      )}

      <form action={updateAgenda} className="space-y-4">
        <AgendaEditor initialTours={tours} />

        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          <Check className="h-4 w-4" aria-hidden="true" />
          Enregistrer
        </button>
      </form>
    </main>
  );
}
