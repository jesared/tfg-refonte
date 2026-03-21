"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, useTransition } from "react";

import {
  type AdminMediaItem,
  deleteMediaAction,
  getMediaLibraryAction,
  updateMediaAltAction,
  uploadMediaAction,
} from "@/app/admin/uploads/actions";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type Toast = {
  id: number;
  type: "success" | "error" | "info";
  message: string;
};

const MAX_FILE_SIZE = 8 * 1024 * 1024;

function formatSize(size: number) {
  return `${(size / (1024 * 1024)).toFixed(2)} Mo`;
}

export function AdminImageUploadForm({ initialMedia }: { initialMedia: AdminMediaItem[] }) {
  const [mediaItems, setMediaItems] = useState<AdminMediaItem[]>(initialMedia);
  const [loadingLibrary, setLoadingLibrary] = useState(true);
  const [isUploading, startUpload] = useTransition();
  const [isSavingAlt, startSaveAlt] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  const [selectedMedia, setSelectedMedia] = useState<AdminMediaItem | null>(null);
  const [altDraft, setAltDraft] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = (type: Toast["type"], message: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 2800);
  };

  useEffect(() => {
    getMediaLibraryAction()
      .then((items) => {
        setMediaItems(items);
      })
      .catch(() => {
        pushToast("error", "Erreur pendant le chargement de la librairie média.");
      })
      .finally(() => setLoadingLibrary(false));
  }, []);

  const selectedMeta = useMemo(
    () => mediaItems.find((item) => item.id === selectedMedia?.id) ?? selectedMedia,
    [mediaItems, selectedMedia],
  );

  function onUploadSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      pushToast("error", "Sélectionnez un fichier avant de lancer l'upload.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      pushToast("error", "Le fichier dépasse la limite de 8 Mo.");
      return;
    }

    pushToast("info", "Upload en cours...");
    startUpload(async () => {
      const result = await uploadMediaAction(formData);

      if (!result.ok || !result.media) {
        pushToast("error", result.message);
        return;
      }

      setMediaItems((prev) => [result.media!, ...prev]);
      form.reset();
      pushToast("success", "Upload réussi.");
    });
  }

  function onSaveAlt() {
    if (!selectedMeta) {
      return;
    }

    startSaveAlt(async () => {
      const result = await updateMediaAltAction({ mediaId: selectedMeta.id, alt: altDraft });

      if (!result.ok) {
        pushToast("error", result.message);
        return;
      }

      setMediaItems((prev) =>
        prev.map((item) => (item.id === selectedMeta.id ? { ...item, alt: altDraft.trim() || null } : item)),
      );
      pushToast("success", "Texte alternatif sauvegardé.");
    });
  }

  function onDelete() {
    if (!selectedMeta) {
      return;
    }

    startDelete(async () => {
      pushToast("info", "Suppression en cours...");
      const result = await deleteMediaAction(selectedMeta.id);

      if (!result.ok) {
        pushToast("error", result.message);
        return;
      }

      setMediaItems((prev) => prev.filter((item) => item.id !== selectedMeta.id));
      setSelectedMedia(null);
      pushToast("success", "Média supprimé.");
    });
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-foreground">Bibliothèque média</h2>
        <p className="text-sm text-muted-foreground">
          Upload vers le bucket objet, stockage des métadonnées en base puis gestion des assets en grille.
        </p>
      </div>

      <form className="mt-5 grid gap-4 rounded-xl border border-border/70 bg-muted/20 p-4 md:grid-cols-[1fr_auto]" onSubmit={onUploadSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-foreground">
            Fichier
            <input
              name="file"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground"
              required
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-foreground">
            Texte alt (optionnel)
            <input
              name="alt"
              type="text"
              maxLength={180}
              placeholder="Ex : finale double senior"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal"
            />
          </label>
        </div>

        <div className="flex items-end">
          <Button type="submit" disabled={isUploading} className="w-full md:w-auto">
            {isUploading ? "Upload..." : "Uploader"}
          </Button>
        </div>
      </form>

      <div className="mt-6">
        {loadingLibrary ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="aspect-square animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : mediaItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun média pour le moment.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {mediaItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedMedia(item);
                  setAltDraft(item.alt ?? "");
                }}
                className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
              >
                <Image
                  src={item.thumbnailUrl}
                  alt={item.alt ?? item.name}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 20vw"
                  className="object-cover transition group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-x-0 bottom-0 bg-black/50 px-2 py-1 text-left text-[11px] text-white">
                  <p className="truncate">{item.name}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <Sheet open={Boolean(selectedMedia)} onOpenChange={(open) => !open && setSelectedMedia(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          {selectedMeta ? (
            <>
              <SheetHeader>
                <SheetTitle>Détails du média</SheetTitle>
                <SheetDescription>Modifiez le texte alternatif ou supprimez l&apos;asset.</SheetDescription>
              </SheetHeader>
              <div className="space-y-4">
                <div className="relative aspect-square overflow-hidden rounded-lg border border-border">
                  <Image
                    src={selectedMeta.thumbnailUrl}
                    alt={selectedMeta.alt ?? selectedMeta.name}
                    fill
                    sizes="400px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p className="break-all">{selectedMeta.key}</p>
                  <p>{formatSize(selectedMeta.size)}</p>
                </div>
                <label className="block space-y-2 text-sm font-medium">
                  Texte alternatif
                  <textarea
                    value={altDraft}
                    onChange={(event) => setAltDraft(event.target.value)}
                    rows={3}
                    maxLength={180}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal"
                  />
                </label>
              </div>
              <SheetFooter className="mt-3">
                <Button variant="outline" onClick={onSaveAlt} disabled={isSavingAlt || isDeleting}>
                  {isSavingAlt ? "Enregistrement..." : "Sauvegarder Alt"}
                </Button>
                <Button variant="destructive" onClick={onDelete} disabled={isDeleting || isSavingAlt}>
                  {isDeleting ? "Suppression..." : "Supprimer"}
                </Button>
              </SheetFooter>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-80 flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-lg border px-3 py-2 text-sm shadow-md ${
              toast.type === "success"
                ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                : toast.type === "error"
                  ? "border-red-300 bg-red-50 text-red-900"
                  : "border-blue-300 bg-blue-50 text-blue-900"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </section>
  );
}
