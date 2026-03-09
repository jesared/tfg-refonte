import { Check, Table2, X } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { TableauxEditor } from "@/components/admin/tableaux-editor";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getTableaux, saveTableaux } from "@/lib/tableaux";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export const metadata: Metadata = {
  title: "Admin - Tableaux",
  description: "Gestion des tableaux côté administration.",
};

async function updateTableaux(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const ids = formData.getAll("id");
  const titles = formData.getAll("title");
  const points = formData.getAll("points");
  const starts = formData.getAll("start");

  const tableauxPayload = Array.from({ length: ids.length }, (_, index) => ({
    id: Number(ids[index]),
    title: String(titles[index] ?? "").trim(),
    points: String(points[index] ?? "").trim(),
    start: String(starts[index] ?? "").trim(),
  })).filter(
    (item) => Number.isFinite(item.id) && item.id > 0 && item.title && item.points && item.start,
  );

  let result: Awaited<ReturnType<typeof saveTableaux>> | null = null;

  try {
    result = await saveTableaux(tableauxPayload);
  } catch {
    redirect("/admin/tableaux?error=1");
  }

  revalidatePath("/tableaux");
  revalidatePath("/admin/tableaux");

  if (!result) {
    redirect("/admin/tableaux?error=1");
  }

  const query = new URLSearchParams({
    updated: "1",
  });

  if (!result.databaseAvailable) {
    query.set("db", "0");
  }

  if (result.storage === "tmp") {
    query.set("storage", "tmp");
  }

  redirect(`/admin/tableaux?${query.toString()}`);
}

export default async function AdminTableauxPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const tableauxData = await getTableaux();
  const params = await searchParams;

  const updatedParam =
    typeof params?.updated === "string"
      ? params.updated
      : typeof params?.ok === "string"
        ? params.ok
        : undefined;
  const storageParam = typeof params?.storage === "string" ? params.storage : undefined;
  const dbParam = typeof params?.db === "string" ? params.db : undefined;
  const errorParam = typeof params?.error === "string" ? params.error : undefined;

  const isUpdated = updatedParam === "1";
  const usedTemporaryStorage = storageParam === "tmp";

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/admin">Administration</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Tableaux</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="rounded-2xl border border-border/70 bg-card/80 px-5 py-6 shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Table2 className="h-4 w-4" aria-hidden="true" />
          Administration
        </div>
        <h1 className="mt-3 text-2xl font-semibold text-foreground">Gestion des tableaux</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tu peux <span className="font-medium text-foreground">ajouter</span>,{" "}
          <span className="font-medium text-foreground">modifier</span> et
          <span className="font-medium text-foreground"> supprimer</span> des tableaux puis
          enregistrer.
        </p>
      </header>

      {errorParam === "1" && (
        <p className="inline-flex items-center gap-2 rounded-xl border border-red-300/60 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-400/40 dark:bg-red-500/10 dark:text-red-200">
          <X className="h-4 w-4" aria-hidden="true" />
          Erreur serveur lors de l&apos;enregistrement. Réessaie dans quelques secondes.
        </p>
      )}

      {isUpdated && (
        <p className="inline-flex items-center gap-2 rounded-xl border border-emerald-300/60 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-500/10 dark:text-emerald-200">
          <Check className="h-4 w-4" aria-hidden="true" />
          Tableaux mis à jour.
        </p>
      )}

      {dbParam === "0" && (
        <p className="inline-flex items-center gap-2 rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-200">
          <X className="h-4 w-4" aria-hidden="true" />
          La BDD n&apos;est pas joignable : les données ont été enregistrées en mode dégradé.
        </p>
      )}

      {usedTemporaryStorage && (
        <p className="inline-flex items-center gap-2 rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-200">
          <X className="h-4 w-4" aria-hidden="true" />
          Stockage temporaire détecté (lecture seule) : les changements peuvent être perdus au redémarrage.
        </p>
      )}

      <form action={updateTableaux} className="space-y-4">
        <TableauxEditor initialTableaux={tableauxData} />

        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          <Check className="h-4 w-4" aria-hidden="true" />
          Enregistrer
        </button>
      </form>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Propositions d&apos;amélioration</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>Ajouter des modèles de tableaux réutilisables (jeunes, seniors, vétérans).</li>
          <li>Mettre en place un contrôle automatique des incohérences de points avant sauvegarde.</li>
          <li>Proposer un historique des versions pour revenir à une publication précédente en un clic.</li>
        </ul>
      </section>

    </main>
  );
}
