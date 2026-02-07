import { getDriveFolders } from "@/lib/googleDrive";
import ClassementsContent from "./ClassementsContent";

export const revalidate = 3600;

type Season = {
  id: string;
  name: string;
};

export default async function ClassementsPage() {
  const rawSeasons = await getDriveFolders(process.env.GOOGLE_DRIVE_FOLDER_ID!);

  // ✅ NORMALISATION DES DONNÉES GOOGLE
  const seasons: Season[] = rawSeasons
    .filter(
      (s): s is { id: string; name: string } =>
        typeof s.id === "string" && typeof s.name === "string",
    )
    .map((s) => ({
      id: s.id,
      name: s.name,
    }));

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <header>
        <h1 className="text-4xl font-bold text-tfg-purple">Classements & Résultats</h1>
        <p className="text-muted-foreground mt-2">
          Classements officiels du Trophée François Grieder
        </p>
      </header>

      <ClassementsContent seasons={seasons} />
    </div>
  );
}
