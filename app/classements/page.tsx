import { getDriveChildren } from "@/lib/googleDrive";
import ClassementsContent from "./ClassementsContent";

export const revalidate = 3600;
export const runtime = "nodejs";

/* =======================
   TYPES
======================= */

type TableauFile = {
  id: string;
  name: string;
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
              // 🔥 Tous les enfants du tour
              const tourChildren = await getDriveChildren(tour.id);

              // 📄 fichiers à la racine du tour
              const fichiers: TableauFile[] = tourChildren
                .filter((f) => !f.isFolder && f.url)
                .map((f) => ({
                  id: f.id,
                  name: f.name.replace(/\.(pdf|jpg|jpeg|png)$/i, ""),
                  url: f.url!,
                }));

              // 📁 sous-dossiers = tableaux
              const tableaux: Tableau[] = await Promise.all(
                tourChildren
                  .filter((child) => child.isFolder)
                  .map(async (tableau) => {
                    const filesRaw = await getDriveChildren(tableau.id);

                    const fichiersTableau: TableauFile[] = filesRaw
                      .filter((f) => !f.isFolder && f.url)
                      .map((f) => ({
                        id: f.id,
                        name: f.name.replace(/\.(pdf|jpg|jpeg|png)$/i, ""),
                        url: f.url!,
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
                fichiers, // ✅ fichiers racine du tour
                tableaux, // ✅ tableaux
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
    <div className="max-w-5xl mx-auto space-y-10">
      <header>
        <h1 className="text-4xl font-bold text-tfg-purple">Classements & Résultats</h1>
        <p className="text-muted-foreground mt-2">
          Classements officiels du Trophée François Grieder
        </p>
      </header>

      <ClassementsContent saisons={saisons} />
    </div>
  );
}
