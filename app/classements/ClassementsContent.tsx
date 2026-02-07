import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Tour = {
  id: string;
  name: string;
  fichiers: {
    id: string;
    name: string;
    url: string;
  }[];
};

type ClassementsContentProps = {
  saisons: {
    id: string;
    name: string;
    tours: Tour[];
  }[];
};

function sortToursDesc(a: { name: string }, b: { name: string }) {
  const getNum = (name: string) => parseInt(name.replace(/\D+/g, ""), 10) || 0;

  return getNum(b.name) - getNum(a.name);
}

export default function ClassementsContent({ saisons }: ClassementsContentProps) {
  const saison = saisons[0];

  if (!saison) {
    return <p className="text-sm text-muted-foreground">Aucun résultat disponible.</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{saison.name}</CardTitle>
      </CardHeader>

      <CardContent>
        <Accordion type="single" collapsible>
          <AccordionItem value="tours">
            <AccordionTrigger>Voir tous les tableaux</AccordionTrigger>

            <AccordionContent>
              <div className="space-y-4">
                {[...saison.tours].sort(sortToursDesc).map((tour) => (
                  <div key={tour.id}>
                    <h4 className="font-semibold text-sm mb-2">{tour.name}</h4>

                    <ul className="space-y-1 pl-4">
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
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
