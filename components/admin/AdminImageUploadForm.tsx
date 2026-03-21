"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, useTransition } from "react";

import {
  type AdminMediaItem,
  deleteMediaManyAction,
  deleteMediaAction,
  getMediaLibraryAction,
  updateMediaAltManyAction,
  updateMediaAltAction,
  updateMediaNameAction,
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
  const [isRefreshingLibrary, startRefreshLibrary] = useTransition();
  const [isUploading, startUpload] = useTransition();
  const [isSavingAlt, startSaveAlt] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const [isBulkDeleting, startBulkDelete] = useTransition();
  const [isBulkSavingAlt, startBulkSaveAlt] = useTransition();
  const [isSavingName, startSaveName] = useTransition();

  const [selectedMedia, setSelectedMedia] = useState<AdminMediaItem | null>(null);
  const [altDraft, setAltDraft] = useState("");
  const [nameDraft, setNameDraft] = useState("");
  const [uploadAltDraft, setUploadAltDraft] = useState("");
  const [bulkAltDraft, setBulkAltDraft] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);
  const [totalItems, setTotalItems] = useState(initialMedia.length);
  const [search, setSearch] = useState("");
  const [mimeType, setMimeType] = useState("");
  const [altFilter, setAltFilter] = useState<"all" | "with-alt" | "without-alt">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<"createdAt" | "name" | "size">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const pushToast = (type: Toast["type"], message: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 2800);
  };

  useEffect(() => {
    startRefreshLibrary(async () => {
      try {
        const result = await getMediaLibraryAction({
          page,
          pageSize,
          search,
          mimeType,
          alt: altFilter,
          dateFrom,
          dateTo,
          sortBy,
          sortOrder,
        });
        setMediaItems(result.items);
        setTotalItems(result.total);
        setSelectedIds((prev) => prev.filter((id) => result.items.some((item) => item.id === id)));
      } catch {
        pushToast("error", "Impossible de rafraîchir la librairie.");
      }
    });
  }, [page, pageSize, search, mimeType, altFilter, dateFrom, dateTo, sortBy, sortOrder]);

  const selectedMeta = useMemo(
    () => mediaItems.find((item) => item.id === selectedMedia?.id) ?? selectedMedia,
    [mediaItems, selectedMedia],
  );
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const allVisibleSelected = mediaItems.length > 0 && mediaItems.every((item) => selectedIds.includes(item.id));

  function onUploadSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      pushToast("error", "Sélectionnez un fichier avant de lancer l'upload.");
      return;
    }

    void uploadSingleFile(file, uploadAltDraft, event.currentTarget);
  }

  async function uploadSingleFile(file: File, alt: string, form?: HTMLFormElement) {
    const formData = new FormData();
    formData.set("file", file);
    formData.set("alt", alt);

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
      setTotalItems((prev) => prev + 1);
      if (form) {
        form.reset();
      }
      setUploadAltDraft("");
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
      setTotalItems((prev) => Math.max(0, prev - 1));
      setSelectedMedia(null);
      pushToast("success", "Média supprimé.");
    });
  }

  function toggleSelection(mediaId: string) {
    setSelectedIds((prev) => (prev.includes(mediaId) ? prev.filter((id) => id !== mediaId) : [...prev, mediaId]));
  }

  function toggleSelectAllVisible() {
    if (allVisibleSelected) {
      setSelectedIds((prev) => prev.filter((id) => !mediaItems.some((item) => item.id === id)));
      return;
    }

    setSelectedIds((prev) => Array.from(new Set([...prev, ...mediaItems.map((item) => item.id)])));
  }

  function onBulkDelete() {
    if (selectedIds.length === 0) {
      pushToast("error", "Sélectionnez au moins un média.");
      return;
    }

    startBulkDelete(async () => {
      const result = await deleteMediaManyAction(selectedIds);

      if (!result.ok) {
        pushToast("error", result.message);
        return;
      }

      setMediaItems((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
      setTotalItems((prev) => Math.max(0, prev - selectedIds.length));
      setSelectedIds([]);
      setSelectedMedia(null);
      pushToast("success", "Médias supprimés.");
    });
  }

  function onBulkSaveAlt() {
    if (selectedIds.length === 0) {
      pushToast("error", "Sélectionnez au moins un média.");
      return;
    }

    startBulkSaveAlt(async () => {
      const result = await updateMediaAltManyAction({ mediaIds: selectedIds, alt: bulkAltDraft });

      if (!result.ok) {
        pushToast("error", result.message);
        return;
      }

      const normalizedAlt = bulkAltDraft.trim() || null;
      setMediaItems((prev) => prev.map((item) => (selectedIds.includes(item.id) ? { ...item, alt: normalizedAlt } : item)));
      pushToast("success", "Texte alternatif appliqué à la sélection.");
    });
  }

  function onCopyUrl() {
    if (!selectedMeta) {
      return;
    }

    navigator.clipboard
      .writeText(selectedMeta.url)
      .then(() => {
        pushToast("success", "URL copiée dans le presse-papiers.");
      })
      .catch(() => {
        pushToast("error", "Impossible de copier l'URL.");
      });
  }

  function onGridKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, item: AdminMediaItem) {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    event.preventDefault();
    setSelectedMedia(item);
    setAltDraft(item.alt ?? "");
    setNameDraft(item.name);
  }

  function onDropUpload(event: React.DragEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files?.[0];

    if (!file || !file.type.startsWith("image/")) {
      pushToast("error", "Déposez un fichier image valide.");
      return;
    }

    void uploadSingleFile(file, uploadAltDraft);
  }

  function onPasteUpload(event: React.ClipboardEvent<HTMLFormElement>) {
    const imageItem = Array.from(event.clipboardData.items).find((item) => item.type.startsWith("image/"));
    if (!imageItem) {
      return;
    }
    const file = imageItem.getAsFile();
    if (!file) {
      return;
    }
    event.preventDefault();
    void uploadSingleFile(file, uploadAltDraft);
  }

  function onSaveName() {
    if (!selectedMeta) {
      return;
    }

    startSaveName(async () => {
      const result = await updateMediaNameAction({ mediaId: selectedMeta.id, name: nameDraft });

      if (!result.ok) {
        pushToast("error", result.message);
        return;
      }

      setMediaItems((prev) => prev.map((item) => (item.id === selectedMeta.id ? { ...item, name: nameDraft.trim() } : item)));
      pushToast("success", "Nom de fichier mis à jour.");
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

      <form
        className={`mt-5 grid gap-4 rounded-xl border border-border/70 bg-muted/20 p-4 transition md:grid-cols-[1fr_auto] ${
          isDragOver ? "border-primary bg-primary/5" : ""
        }`}
        onSubmit={onUploadSubmit}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={onDropUpload}
        onPaste={onPasteUpload}
      >
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
            <p className="text-xs font-normal text-muted-foreground">
              Formats acceptés : JPG, PNG, WEBP, AVIF — taille maximale : 8 Mo.
            </p>
          </label>
          <label className="space-y-2 text-sm font-medium text-foreground">
            Texte alt (optionnel)
            <input
              name="alt"
              type="text"
              value={uploadAltDraft}
              onChange={(event) => setUploadAltDraft(event.target.value)}
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
      <p className="mt-2 text-xs text-muted-foreground">
        Astuce : glissez-déposez une image sur la zone d&apos;upload ou collez directement depuis le presse-papiers.
      </p>
      {isUploading ? (
        <div className="mt-3 space-y-2">
          <p className="text-sm font-medium text-primary">Téléversement en cours...</p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-primary" />
          </div>
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 rounded-xl border border-border/70 bg-muted/20 p-4 md:grid-cols-2 lg:grid-cols-4">
        <label className="space-y-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Recherche
          <input
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            placeholder="Nom ou clé"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal text-foreground"
          />
        </label>
        <label className="space-y-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Type MIME
          <select
            value={mimeType}
            onChange={(event) => {
              setPage(1);
              setMimeType(event.target.value);
            }}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal text-foreground"
          >
            <option value="">Tous</option>
            <option value="image/webp">image/webp</option>
            <option value="image/jpeg">image/jpeg</option>
            <option value="image/png">image/png</option>
            <option value="image/avif">image/avif</option>
          </select>
        </label>
        <label className="space-y-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Texte alt
          <select
            value={altFilter}
            onChange={(event) => {
              setPage(1);
              setAltFilter(event.target.value as "all" | "with-alt" | "without-alt");
            }}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal text-foreground"
          >
            <option value="all">Tous</option>
            <option value="with-alt">Avec alt</option>
            <option value="without-alt">Sans alt</option>
          </select>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="space-y-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Du
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => {
                setPage(1);
                setDateFrom(event.target.value);
              }}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal text-foreground"
            />
          </label>
          <label className="space-y-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Au
            <input
              type="date"
              value={dateTo}
              onChange={(event) => {
                setPage(1);
                setDateTo(event.target.value);
              }}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal text-foreground"
            />
          </label>
        </div>
      </div>

      <div className="mt-3 grid gap-3 rounded-xl border border-border/70 bg-muted/20 p-4 md:grid-cols-[1fr_auto_auto_auto]">
        <label className="space-y-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Trier par
          <select
            value={sortBy}
            onChange={(event) => {
              setPage(1);
              setSortBy(event.target.value as "createdAt" | "name" | "size");
            }}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal text-foreground"
          >
            <option value="createdAt">Date</option>
            <option value="name">Nom</option>
            <option value="size">Poids</option>
          </select>
        </label>
        <label className="space-y-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Ordre
          <select
            value={sortOrder}
            onChange={(event) => {
              setPage(1);
              setSortOrder(event.target.value as "asc" | "desc");
            }}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal text-foreground"
          >
            <option value="desc">Décroissant</option>
            <option value="asc">Croissant</option>
          </select>
        </label>
        <label className="space-y-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Par page
          <select
            value={pageSize}
            onChange={(event) => {
              setPage(1);
              setPageSize(Number(event.target.value));
            }}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal text-foreground"
          >
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={36}>36</option>
            <option value={60}>60</option>
          </select>
        </label>
        <div className="flex items-end justify-end text-sm text-muted-foreground">
          {totalItems} média{totalItems > 1 ? "s" : ""}
        </div>
      </div>

      <div className="mt-3 grid gap-3 rounded-xl border border-border/70 bg-muted/20 p-4 md:grid-cols-[auto_1fr_auto_auto]">
        <Button type="button" variant="outline" onClick={toggleSelectAllVisible} disabled={mediaItems.length === 0}>
          {allVisibleSelected ? "Désélectionner la page" : "Sélectionner la page"}
        </Button>
        <input
          value={bulkAltDraft}
          onChange={(event) => setBulkAltDraft(event.target.value)}
          placeholder="Texte alt à appliquer à la sélection"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          maxLength={180}
        />
        <Button type="button" variant="outline" onClick={onBulkSaveAlt} disabled={isBulkSavingAlt || selectedIds.length === 0}>
          {isBulkSavingAlt ? "Application..." : "Appliquer Alt"}
        </Button>
        <Button type="button" variant="destructive" onClick={onBulkDelete} disabled={isBulkDeleting || selectedIds.length === 0}>
          {isBulkDeleting ? "Suppression..." : `Supprimer (${selectedIds.length})`}
        </Button>
      </div>

      <div className="mt-6">
        {isRefreshingLibrary ? (
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
                  setNameDraft(item.name);
                }}
                onKeyDown={(event) => onGridKeyDown(event, item)}
                className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.id)}
                  onChange={(event) => {
                    event.stopPropagation();
                    toggleSelection(item.id);
                  }}
                  onClick={(event) => event.stopPropagation()}
                  className="absolute left-2 top-2 z-20 h-4 w-4 accent-primary"
                  aria-label={`Sélectionner ${item.name}`}
                />
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
      <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/20 p-3 text-sm">
        <Button type="button" variant="outline" onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page <= 1}>
          Précédent
        </Button>
        <p className="text-muted-foreground">
          Page {page} / {totalPages}
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={page >= totalPages}
        >
          Suivant
        </Button>
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
                  <p className="font-medium text-foreground">{new Date(selectedMeta.createdAt).toLocaleString("fr-FR")}</p>
                  <p className="break-all">{selectedMeta.key}</p>
                  <p>{formatSize(selectedMeta.size)}</p>
                  <p>
                    {selectedMeta.width && selectedMeta.height
                      ? `${selectedMeta.width} × ${selectedMeta.height} px`
                      : "Dimensions indisponibles"}
                  </p>
                </div>
                <label className="block space-y-2 text-sm font-medium">
                  Nom du fichier
                  <input
                    value={nameDraft}
                    onChange={(event) => setNameDraft(event.target.value)}
                    maxLength={180}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal"
                  />
                </label>
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
                <Button variant="secondary" onClick={onCopyUrl} disabled={isSavingAlt || isDeleting}>
                  Copier l&apos;URL
                </Button>
                <Button variant="outline" onClick={onSaveName} disabled={isSavingName || isDeleting || isSavingAlt}>
                  {isSavingName ? "Renommage..." : "Renommer"}
                </Button>
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

      <div className="pointer-events-none fixed inset-x-2 bottom-3 z-[60] flex max-w-md flex-col gap-2 sm:inset-x-auto sm:right-4 sm:w-80">
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
