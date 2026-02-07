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
  fichiers: TableauFile[]; // ✅ fichiers à la racine du tour
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
              <Accordion type="multiple" className="space-y-2">
                {[...saison.tours].sort(sortToursDesc).map((tour) => (
                  <AccordionItem key={tour.id} value={tour.id}>
                    <AccordionTrigger className="font-semibold">{tour.name}</AccordionTrigger>

                    <AccordionContent className="space-y-4">
                      {/* 📄 fichiers à la racine du tour */}
                      {tour.fichiers.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Folder className="h-4 w-4 text-tfg-purple" />
                            Documents
                          </h5>
                          <ul className="space-y-1 pl-6">
                            {tour.fichiers.map((file) => (
                              <li key={file.id}>
                                <a
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-sm text-tfg-purple hover:underline"
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
                        </div>
                      )}

                      {/* 📁 tableaux */}
                      {tour.tableaux.map((tableau) => (
                        <div key={tableau.id} className="pl-2">
                          <h6 className="flex items-center gap-2 text-sm font-semibold mb-1">
                            <Folder className="h-4 w-4 text-slate-500" />
                            {tableau.name}
                          </h6>

                          {tableau.fichiers.length === 0 ? (
                            <p className="text-xs text-muted-foreground pl-6">Aucun fichier.</p>
                          ) : (
                            <ul className="space-y-1 pl-6">
                              {tableau.fichiers.map((file) => (
                                <li key={file.id}>
                                  <a
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-tfg-purple hover:underline"
                                  >
                                    <File className="h-4 w-4" />
                                    {file.name}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
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
