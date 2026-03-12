import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminImageUploadForm } from "@/components/admin/AdminImageUploadForm";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export const metadata: Metadata = {
  title: "Admin - Upload d'images",
  description: "Ajout d'images administrateur pour les contenus du site.",
};

export default async function AdminUploadsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <header className="rounded-2xl border border-border bg-card px-6 py-7 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Administration
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-foreground">Upload d&apos;images</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Point d&apos;entrée rapide pour alimenter le site avec des visuels gérés par
          l&apos;équipe admin.
        </p>
        <div className="mt-4">
          <Link href="/admin" className="text-sm font-semibold text-primary hover:underline">
            ← Retour au dashboard admin
          </Link>
        </div>
      </header>

      <AdminImageUploadForm />
    </main>
  );
}
