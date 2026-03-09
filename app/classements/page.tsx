import { getDriveChildren } from "@/lib/googleDrive";
import ClassementsContent from "./ClassementsContent";

export const revalidate = 3600;
export const runtime = "nodejs";

/* =======================
   TYPES
======================= */

type TableauFile = {
  id: string;
  name: string; // nom AVEC extension
  url: string;
};

type Tableau = {
  id: string;
  name: string;
  fichiers: TableauFile[];
};

type Tour = {
  id: string;
  name: string;
  fichiers: TableauFile[]; // fichiers à la racine du tour
  tableaux: Tableau[];
};

type Saison = {
  id: string;
  name: string;
  tours: Tour[];
};

/* =======================
   PAGE
======================= */

export default async function ClassementsPage() {
  const rootId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!rootId) {
    throw new Error("GOOGLE_DRIVE_FOLDER_ID manquant");
  }

  const saisonsRaw = await getDriveChildren(rootId);

  const saisons: Saison[] = await Promise.all(
    saisonsRaw
      .filter((s) => s.isFolder)
      .map(async (saison) => {
        const toursRaw = await getDriveChildren(saison.id);

        const tours: Tour[] = await Promise.all(
          toursRaw
            .filter((t) => t.isFolder)
            .map(async (tour) => {
              const tourChildren = await getDriveChildren(tour.id);

              // 📄 fichiers à la racine du tour
              const fichiers: TableauFile[] = tourChildren
                .filter(
                  (f): f is { id: string; name: string; url: string; isFolder: false } =>
                    !f.isFolder && typeof f.url === "string",
                )
                .map((f) => ({
                  id: f.id,
                  name: f.name,
                  url: f.url,
                }));

              // 📁 tableaux
              const tableaux: Tableau[] = await Promise.all(
                tourChildren
                  .filter((child) => child.isFolder)
                  .map(async (tableau) => {
                    const filesRaw = await getDriveChildren(tableau.id);

                    const fichiersTableau: TableauFile[] = filesRaw
                      .filter(
                        (f): f is { id: string; name: string; url: string; isFolder: false } =>
                          !f.isFolder && typeof f.url === "string",
                      )
                      .map((f) => ({
                        id: f.id,
                        name: f.name,
                        url: f.url,
                      }));

                    return {
                      id: tableau.id,
                      name: tableau.name,
                      fichiers: fichiersTableau,
                    };
                  }),
              );

              return {
                id: tour.id,
                name: tour.name,
                fichiers,
                tableaux,
              };
            }),
        );

        return {
          id: saison.id,
          name: saison.name,
          tours,
        };
      }),
  );

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 sm:gap-10">
      <section className="rounded-3xl border border-border bg-card px-5 py-7 shadow-sm sm:px-8 sm:py-10">
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:text-sm">
          <span aria-hidden="true" className="text-lg">
            🏆
          </span>
          <span>Classements officiels</span>
        </div>

        <div className="mt-4 space-y-4">
          <h1 className="text-2xl font-semibold text-primary sm:text-4xl">
            Classements & Résultats
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Consultez les documents publiés pour chaque saison et chaque tour du Trophée François
            Grieder, dans une présentation harmonisée avec le reste du site.
          </p>
        </div>
      </section>

      <ClassementsContent saisons={saisons} />
    </main>
  );
}
