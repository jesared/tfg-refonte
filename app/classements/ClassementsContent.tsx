import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Season = {
  id: string;
  name: string;
};

type ClassementsContentProps = {
  seasons: Season[];
};

export default function ClassementsContent({ seasons }: ClassementsContentProps) {
  return (
    <div className="space-y-6">
      {seasons.map((season) => (
        <Card key={season.id}>
          <CardHeader>
            <CardTitle>{season.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Résultats à venir</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
