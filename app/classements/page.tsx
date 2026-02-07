import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDriveFolders } from "@/lib/googleDrive";

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
          Classements officiels du Trophée François Grieder par saison
        </p>
      </header>

      {seasons.map(async (season) => {
        const files = await getDriveFiles(season.id!);

        return (
          <Card key={season.id}>
            <CardHeader>
              <CardTitle>{season.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {files.map((file) => (
                <a
                  key={file.id}
                  href={file.webViewLink!}
                  target="_blank"
                  className="flex items-center justify-between rounded-md border p-3 hover:bg-muted transition"
                >
                  <span>{file.name.replace(".pdf", "")}</span>
                  <span className="text-sm text-tfg-purple font-medium">Voir le PDF</span>
                </a>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
