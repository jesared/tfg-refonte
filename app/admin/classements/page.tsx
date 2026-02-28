import {
  CalendarDays,
  ChevronRight,
  Check,
  Folder,
  ShieldCheck,
  Table2,
  Trophy,
  User,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { getDriveChildren } from "@/lib/googleDrive";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export const metadata: Metadata = {
  title: "Admin - Classements",
  description: "Préparation des publications mensuelles des classements.",
};

type DrivePreview = {
  saisonCount: number;
  tourCount: number;
  fileCount: number;
  latestSaisons: Array<{
    id: string;
    name: string;
    tours: number;
    files: number;
  }>;
};

const publicationSteps = [
  { label: "Collecte des résultats", owner: "Automatique", status: "Terminé" },
  { label: "Contrôle manuel des anomalies", owner: "Pôle sportif", status: "En cours" },
  { label: "Validation finale", owner: "Responsable classement", status: "À lancer" },
  { label: "Diffusion clubs & site", owner: "Communication", status: "Planifié" },
];

async function getDrivePreview(rootId: string): Promise<DrivePreview> {
  const saisonsRaw = (await getDriveChildren(rootId)).filter((item) => item.isFolder);

  let tourCount = 0;
  let fileCount = 0;

  const latestSaisons = await Promise.all(
    saisonsRaw.slice(0, 3).map(async (saison) => {
      const toursRaw = (await getDriveChildren(saison.id)).filter((item) => item.isFolder);
      tourCount += toursRaw.length;

      let saisonFiles = 0;

      await Promise.all(
        toursRaw.map(async (tour) => {
          const tourChildren = await getDriveChildren(tour.id);
          const rootFiles = tourChildren.filter((child) => !child.isFolder).length;
          const tableauFolders = tourChildren.filter((child) => child.isFolder);

          const tableauFiles = await Promise.all(
            tableauFolders.map(async (tableau) => (await getDriveChildren(tableau.id)).filter((f) => !f.isFolder).length),
          );

          const totalTourFiles = rootFiles + tableauFiles.reduce((acc, current) => acc + current, 0);
          fileCount += totalTourFiles;
          saisonFiles += totalTourFiles;
        }),
      );

      return {
        id: saison.id,
        name: saison.name,
        tours: toursRaw.length,
        files: saisonFiles,
      };
    }),
  );

  return {
    saisonCount: saisonsRaw.length,
    tourCount,
    fileCount,
    latestSaisons,
  };
}

export default async function AdminClassementsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const rootId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const drivePreview = rootId ? await getDrivePreview(rootId) : null;

  const trendCards = [
    { label: "Saisons détectées", value: drivePreview ? `${drivePreview.saisonCount}` : "—", icon: Trophy },
    { label: "Tours dans le Drive", value: drivePreview ? `${drivePreview.tourCount}` : "—", icon: ShieldCheck },
    { label: "Fichiers recensés", value: drivePreview ? `${drivePreview.fileCount}` : "—", icon: Check },
  ];

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <header className="rounded-2xl border border-border bg-card px-6 py-7 shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          Pilotage mensuel
        </div>
        <h1 className="mt-4 text-3xl font-semibold text-foreground">Publication des classements</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Cette page reprend la structure réellement présente sur Google Drive pour préparer la
          publication mensuelle sans ressaisie.
        </p>
      </header>

      {!rootId ? (
        <section className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5 text-sm text-amber-900 dark:text-amber-100">
          <div className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>
              Variable d&apos;environnement <code>GOOGLE_DRIVE_FOLDER_ID</code> manquante.
              Impossible de précharger un aperçu du Drive.
            </p>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        {trendCards.map((card) => (
          <article key={card.label} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2 text-primary">
              <card.icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="mt-1 text-3xl font-semibold text-foreground">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Check className="h-4 w-4 text-primary" aria-hidden="true" />
          Pipeline de publication
        </div>
        <ul className="space-y-3">
          {publicationSteps.map((step) => (
            <li
              key={step.label}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium text-foreground">{step.label}</p>
                <p className="text-muted-foreground">Responsable : {step.owner}</p>
              </div>
              <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-foreground/90">
                {step.status}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Folder className="h-4 w-4 text-primary" aria-hidden="true" />
          Aperçu des dernières saisons du Drive
        </div>

        {drivePreview && drivePreview.latestSaisons.length > 0 ? (
          <ul className="space-y-3">
            {drivePreview.latestSaisons.map((saison) => (
              <li
                key={saison.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-4 py-3 text-sm"
              >
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{saison.name}</p>
                  <p className="text-muted-foreground">
                    {saison.tours} tour{saison.tours > 1 ? "s" : ""} • {saison.files} fichier
                    {saison.files > 1 ? "s" : ""}
                  </p>
                </div>
                <Link
                  href="/classements"
                  className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/5"
                >
                  Voir sur le site
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">
            Aucun dossier de saison détecté pour le moment.
          </p>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted"
        >
          <Table2 className="h-4 w-4" aria-hidden="true" />
          Exporter la version de contrôle
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm font-medium text-primary transition hover:bg-primary/15"
        >
          <User className="h-4 w-4" aria-hidden="true" />
          Préparer l&apos;envoi aux clubs
        </button>
      </section>

      <section className="rounded-2xl border border-border/80 bg-muted/20 p-5 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 font-medium text-foreground">
          <Folder className="h-4 w-4 text-primary" aria-hidden="true" />
          Conseil
        </div>
        <p className="mt-2">
          Conservez la hiérarchie <strong>Saison → Tour → Tableaux/Fichiers</strong> sur le Drive
          pour éviter les erreurs de diffusion et accélérer la préparation des publications.
        </p>
      </section>
    </main>
  );
}
