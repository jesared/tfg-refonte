import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { NewCategoryForm } from "@/app/admin/categories/_components/NewCategoryForm";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export default async function NewCategoryPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }


  return (
    <main className="mx-auto w-full max-w-3xl space-y-4 p-8">
      <header className="space-y-1">
        <Link href="/admin/tournaments" className="text-sm text-blue-600">
          ← Retour aux tournois
        </Link>
        <h1 className="text-2xl font-bold">Nouvelle catégorie</h1>
        <p className="text-sm text-gray-500">Créer une catégorie commune à tous les tours.</p>
      </header>

      <NewCategoryForm />
    </main>
  );
}
