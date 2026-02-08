"use client";

import { DriveImage } from "@/components/DriveImage";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { File, Folder, Image } from "@/lib/lucide-react";
import { useState } from "react";

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
  fichiers: TableauFile[];
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

function isImageFile(name: string) {
  return /\.(jpg|jpeg|png)$/i.test(name);
}

function getSeasonImages(saison: Saison): TableauFile[] {
  const images: TableauFile[] = [];

  for (const tour of saison.tours) {
    // images à la racine du tour
    images.push(...tour.fichiers.filter((f) => isImageFile(f.name)));

    // images dans les tableaux
    for (const tableau of tour.tableaux) {
      images.push(...tableau.fichiers.filter((f) => isImageFile(f.name)));
    }
  }

  return images;
}
function sortSaisonsDesc(a: Saison, b: Saison) {
  const getStartYear = (name: string) => parseInt(name.split("/")[0], 10) || 0;

  return getStartYear(b.name) - getStartYear(a.name);
}
function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/* =======================
   COMPONENT
======================= */

export default function ClassementsContent({ saisons }: ClassementsContentProps) {
  const [fullscreenImage, setFullscreenImage] = useState<{
    fileId: string;
    alt: string;
  } | null>(null);

  return (
    <div className="space-y-6">
      {[...saisons].sort(sortSaisonsDesc).map((saison) => (
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
              <Accordion type="single" collapsible className="space-y-2">
                {[...saison.tours].sort(sortToursDesc).map((tour) => (
                  <AccordionItem key={tour.id} value={tour.id}>
                    <AccordionTrigger className="font-semibold">{tour.name}</AccordionTrigger>

                    <AccordionContent
                      className="
    space-y-4
    overflow-hidden
    data-[state=open]:animate-accordion-down
    data-[state=closed]:animate-accordion-up
  "
                    >
                      {/* 📄 fichiers à la racine du tour */}
                      {tour.fichiers.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Folder className="h-4 w-4 text-tfg-purple" />
                            Documents
                          </h5>

                          <ul className="space-y-3 pl-6">
                            {tour.fichiers.map((file) => (
                              <li key={file.id}>
                                {isImageFile(file.name) ? (
                                  <>
                                    <div className="flex items-center gap-2 text-sm font-medium text-tfg-purple">
                                      <Image className="h-4 w-4" />
                                      Affiche
                                    </div>

                                    <div
                                      className="mt-2 pl-6 cursor-zoom-in"
                                      onClick={async () => {
                                        const src = `https://drive.google.com/thumbnail?id=${file.id}&sz=w2000`;

                                        try {
                                          await preloadImage(src); // 👈 PRÉCHARGEMENT
                                          setFullscreenImage({
                                            fileId: file.id,
                                            alt: file.name,
                                          });
                                        } catch {
                                          console.warn("Image non disponible");
                                        }
                                      }}
                                    >
                                      <DriveImage
                                        fileId={file.id}
                                        alt={file.name}
                                        className="max-h-16 w-auto rounded-md border hover:shadow-lg transition"
                                      />
                                    </div>
                                  </>
                                ) : (
                                  <a
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-tfg-purple hover:underline"
                                  >
                                    <File className="h-4 w-4" />
                                    {file.name}
                                  </a>
                                )}
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
                            <ul className="space-y-3 pl-6">
                              {tableau.fichiers.map((file) => (
                                <li key={file.id}>
                                  {isImageFile(file.name) ? (
                                    <>
                                      <div className="flex items-center gap-2 text-sm font-medium text-tfg-purple">
                                        <Image className="h-4 w-4" />
                                        Affiche
                                      </div>

                                      <div
                                        className="mt-2 pl-6 cursor-zoom-in"
                                        onClick={async () => {
                                          const src = `https://drive.google.com/thumbnail?id=${file.id}&sz=w2000`;

                                          try {
                                            await preloadImage(src); // 👈 PRÉCHARGEMENT
                                            setFullscreenImage({
                                              fileId: file.id,
                                              alt: file.name,
                                            });
                                          } catch {
                                            console.warn("Image non disponible");
                                          }
                                        }}
                                      >
                                        <DriveImage
                                          fileId={file.id}
                                          alt={file.name}
                                          className="max-h-16 w-auto rounded-md border hover:shadow-lg transition"
                                        />
                                      </div>
                                    </>
                                  ) : (
                                    <a
                                      href={file.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 text-sm text-tfg-purple hover:underline"
                                    >
                                      <File className="h-4 w-4" />
                                      {file.name}
                                    </a>
                                  )}
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
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setFullscreenImage(null)}
        >
          <img
            src={`https://drive.google.com/thumbnail?id=${fullscreenImage.fileId}&sz=w2000`}
            alt={fullscreenImage.alt}
            className="max-h-full max-w-full object-contain rounded-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            onClick={() => setFullscreenImage(null)}
            className="absolute top-4 right-4 text-white text-sm bg-black/60 hover:bg-black/80 px-3 py-1 rounded"
          >
            Fermer ✕
          </button>
        </div>
      )}
    </div>
  );
}
