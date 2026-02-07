import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ClassementsContentProps = {
  saisons: {
    id: string;
    name: string;
    tours: {
      id: string;
      name: string;
      fichiers: {
        id: string;
        name: string;
        url: string;
      }[];
    }[];
  }[];
};

export default function ClassementsContent({ saisons }: ClassementsContentProps) {
  return (
    <div className="space-y-6">
      {saisons.map((saison) => (
        <Card key={saison.id}>
          <CardHeader>
            <CardTitle>{saison.name}</CardTitle>
          </CardHeader>

          <CardContent>
            {saison.tours.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun résultat disponible pour cette saison.
              </p>
            ) : (
              <Accordion type="multiple" className="space-y-2">
                {saison.tours.map((tour) => (
                  <AccordionItem key={tour.id} value={tour.id}>
                    <AccordionTrigger>{tour.name}</AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2">
                        {tour.fichiers.map((file) => (
                          <li key={file.id}>
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-tfg-purple hover:underline"
                            >
                              {file.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
