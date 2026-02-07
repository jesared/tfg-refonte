import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { File, Folder, Image } from "@/lib/lucide-react";

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

type ClassementsContentProps = {
  saisons: Saison[];
};

/* =======================
   HELPERS
======================= */

function sortToursDesc(a: { name: string }, b: { name: string }) {
  const extract = (name: string) => {
    const match = name.match(/tour\s*(\d+)/i);
    return match ? parseInt(match[1], 10) : 0;
  };

  return extract(b.name) - extract(a.name);
}

/* =======================
   COMPONENT
======================= */

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
              <Accordion type="single" collapsible>
                <AccordionItem value={saison.id}>
                  <AccordionTrigger>Voir tous les tableaux</AccordionTrigger>

                  <AccordionContent>
                    <div className="space-y-4">
                      {[...saison.tours].sort(sortToursDesc).map((tour) => (
                        <div key={tour.id} className="rounded-md border border-slate-200 p-3">
                          {/* TOUR */}
                          <h4 className="flex items-center gap-2 font-semibold text-sm mb-3">
                            <Folder className="h-4 w-4 text-tfg-purple" />
                            {tour.name}
                          </h4>

                          {/* TABLEAUX */}
                          {tour.tableaux.length === 0 ? (
                            <p className="text-xs text-muted-foreground pl-6">
                              Aucun tableau pour ce tour.
                            </p>
                          ) : (
                            <div className="space-y-3 pl-4">
                              {tour.tableaux.map((tableau) => (
                                <div key={tableau.id}>
                                  <h5 className="flex items-center gap-2 text-sm font-medium mb-1">
                                    <Folder className="h-4 w-4 text-slate-500" />
                                    {tableau.name}
                                  </h5>

                                  {tableau.fichiers.length === 0 ? (
                                    <p className="text-xs text-muted-foreground pl-6">
                                      Aucun fichier.
                                    </p>
                                  ) : (
                                    <ul className="space-y-1 pl-6">
                                      {tableau.fichiers.map((file) => (
                                        <li key={file.id}>
                                          <a
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-tfg-purple hover:underline text-sm"
                                          >
                                            {file.name.match(/\.(jpg|jpeg|png)$/i) ? (
                                              <Image className="h-4 w-4" />
                                            ) : (
                                              <File className="h-4 w-4" />
                                            )}
                                            {file.name}
                                          </a>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
