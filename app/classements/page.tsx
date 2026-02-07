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
  const rootId = process.env.GOOGLE_DRIVE_FOLDER_ID!;
  const saisonsRaw = await getDriveChildren(rootId);

  const saisons: Saison[] = [];

  for (const saison of saisonsRaw.filter((s) => s.isFolder)) {
    const toursRaw = await getDriveChildren(saison.id);

    const tours: Tour[] = [];

    for (const tour of toursRaw.filter((t) => t.isFolder)) {
      const tableauxRaw = await getDriveChildren(tour.id);

      const tableaux: Tableau[] = [];

      for (const tableau of tableauxRaw.filter((t) => t.isFolder)) {
        const filesRaw = await getDriveChildren(tableau.id);

        const fichiers: TableauFile[] = filesRaw
          .filter((f) => !f.isFolder && typeof f.url === "string")
          .map((f) => ({
            id: f.id,
            name: f.name.replace(/\.(pdf|jpg|jpeg|png)$/i, ""),
            url: f.url!, // safe après le filter
          }));

        tableaux.push({
          id: tableau.id,
          name: tableau.name,
          fichiers,
        });
      }

      tours.push({
        id: tour.id,
        name: tour.name,
        tableaux,
      });
    }

    saisons.push({
      id: saison.id,
      name: saison.name,
      tours,
    });
  }

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
