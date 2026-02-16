"use client";

import { DriveImage } from "@/components/DriveImage";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { File, Folder, Image as ImageIcon } from "@/lib/lucide-react";
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

function sortSaisonsDesc(a: Saison, b: Saison) {
  const getStartYear = (name: string) => parseInt(name.split("/")[0], 10) || 0;
  return getStartYear(b.name) - getStartYear(a.name);
}

function countAllFiles(tour: Tour) {
  return (
    tour.fichiers.length + tour.tableaux.reduce((acc, tableau) => acc + tableau.fichiers.length, 0)
  );
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

  const openFullscreen = async (file: TableauFile) => {
    const src = `https://drive.google.com/thumbnail?id=${file.id}&sz=w2000`;

    try {
      await preloadImage(src);
      setFullscreenImage({
        fileId: file.id,
        alt: file.name,
      });
    } catch {
      console.warn("Image non disponible");
    }
  };

  const renderFile = (file: TableauFile) => {
    if (isImageFile(file.name)) {
      return (
        <button
          type="button"
          onClick={() => openFullscreen(file)}
          className="group w-full rounded-lg border border-border/60 bg-muted/20 p-2 text-left transition hover:border-primary/40 hover:bg-muted/40"
        >
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <ImageIcon className="h-4 w-4" />
            <span>Affiche</span>
          </div>

          <DriveImage
            fileId={file.id}
            alt={file.name}
            className="mt-2 max-h-24 w-auto rounded-md border border-border object-contain transition group-hover:shadow-lg"
          />

          <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">{file.name}</p>
        </button>
      );
    }

    return (
      <a
        href={file.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-full items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2 text-sm text-primary transition hover:border-primary/40 hover:bg-primary/5"
      >
        <File className="h-4 w-4 shrink-0" />
        <span className="line-clamp-2">{file.name}</span>
      </a>
    );
  };

  return (
    <div className="space-y-6">
      {[...saisons].sort(sortSaisonsDesc).map((saison) => (
        <Card key={saison.id} className="border-border/70 shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="text-xl">{saison.name}</CardTitle>
          </CardHeader>

          <CardContent>
            {saison.tours.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border/70 px-4 py-6 text-sm text-muted-foreground">
                Aucun résultat disponible pour cette saison.
              </p>
            ) : (
              <Accordion type="single" collapsible className="space-y-3">
                {[...saison.tours].sort(sortToursDesc).map((tour) => (
                  <AccordionItem
                    key={tour.id}
                    value={`${saison.id}-${tour.id}`}
                    className="overflow-hidden rounded-xl border border-border/70 bg-card"
                  >
                    <AccordionTrigger className="px-4 font-semibold hover:no-underline">
                      <div className="flex w-full items-center justify-between gap-4 pr-3">
                        <span>{tour.name}</span>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          {countAllFiles(tour)} fichier{countAllFiles(tour) > 1 ? "s" : ""}
                        </span>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="overflow-hidden px-4 pb-4 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                      <div className="pt-2 space-y-5">
                        {/* 📄 fichiers à la racine du tour */}
                        {tour.fichiers.length > 0 && (
                          <section className="space-y-3">
                            <h5 className="flex items-center gap-2 text-sm font-semibold">
                              <Folder className="h-4 w-4 text-primary" />
                              Documents
                            </h5>

                            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                              {tour.fichiers.map((file) => (
                                <li key={file.id}>{renderFile(file)}</li>
                              ))}
                            </ul>
                          </section>
                        )}

                        {/* 📁 tableaux */}
                        {tour.tableaux.length > 0 && (
                          <section className="space-y-3">
                            <h5 className="flex items-center gap-2 text-sm font-semibold">
                              <Folder className="h-4 w-4 text-primary" />
                              Tableaux
                            </h5>

                            <div className="space-y-4">
                              {tour.tableaux.map((tableau) => (
                                <div
                                  key={tableau.id}
                                  className="rounded-lg border border-border/70 bg-muted/15 p-3"
                                >
                                  <h6 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                                    <Folder className="h-4 w-4 text-muted-foreground" />
                                    {tableau.name}
                                  </h6>

                                  {tableau.fichiers.length === 0 ? (
                                    <p className="text-xs text-muted-foreground">Aucun fichier.</p>
                                  ) : (
                                    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                      {tableau.fichiers.map((file) => (
                                        <li key={file.id}>{renderFile(file)}</li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ))}
                            </div>
                          </section>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      ))}

      {/* FULLSCREEN IMAGE */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
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
            className="absolute right-4 top-4 rounded bg-black/60 px-3 py-1 text-sm text-primary-foreground hover:bg-black/80"
          >
            Fermer ✕
          </button>
        </div>
      )}
    </div>
  );
}
