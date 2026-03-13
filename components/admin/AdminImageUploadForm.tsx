"use client";

import { useState } from "react";

type MediaItem = {
  id: string;
  originalUrl: string;
  thumbnailUrl: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  createdAt: string;
  altText: string | null;
  sourceRef: string | null;
};

const MAX_FILE_SIZE = 8 * 1024 * 1024;

function formatSize(size: number) {
  return `${(size / (1024 * 1024)).toFixed(2)} Mo`;
}

export function AdminImageUploadForm({ initialMedia }: { initialMedia: MediaItem[] }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(initialMedia);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      setError("Sélectionne une image avant de lancer l'upload.");
      setIsLoading(false);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Le fichier dépasse 8 Mo. Réduis l'image puis réessaie.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/uploads", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json().catch(() => null)) as {
        media?: MediaItem;
        error?: string;
      } | null;

      if (!response.ok || !payload?.media) {
        setError(payload?.error ?? "Upload impossible.");
        return;
      }

      const uploadedMedia = payload.media;
      setMediaItems((prev) => [uploadedMedia, ...prev]);
      event.currentTarget.reset();
    } catch {
      setError("Upload impossible. Vérifie la connexion et la configuration serveur.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(mediaId: string) {
    const previousItems = mediaItems;
    setMediaItems((prev) => prev.filter((item) => item.id !== mediaId));

    try {
      const response = await fetch(`/api/admin/uploads/${mediaId}`, { method: "DELETE" });

      if (!response.ok) {
        setMediaItems(previousItems);
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? "Suppression impossible.");
      }
    } catch {
      setMediaItems(previousItems);
      setError("Suppression impossible. Vérifie la connexion et réessaie.");
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">Média admin V2 (S3 + thumbnails)</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Upload compressé en WebP, miniature générée automatiquement, puis enregistrement en base.
      </p>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="admin-image-file" className="text-sm font-medium text-foreground">
            Fichier image
          </label>
          <input
            id="admin-image-file"
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground"
            required
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-foreground">
            Texte alternatif (optionnel)
            <input
              name="altText"
              type="text"
              maxLength={180}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal"
              placeholder="Ex: remise des prix catégorie junior"
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-foreground">
            Source/licence (optionnel)
            <input
              name="sourceRef"
              type="text"
              maxLength={255}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal"
              placeholder="Ex: Photo interne / Unsplash - auteur"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? "Upload en cours..." : "Envoyer l'image"}
        </button>
      </form>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      <div className="mt-6 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Derniers médias uploadés</h3>
        {mediaItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun média pour le moment.</p>
        ) : (
          <ul className="space-y-3">
            {mediaItems.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-3 rounded-xl border border-border/70 bg-muted/20 p-3 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.thumbnailUrl}
                    alt={item.altText ?? "Miniature média"}
                    className="h-16 w-16 rounded-md border border-border object-cover"
                  />
                  <div className="text-sm">
                    <a
                      href={item.originalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-primary hover:underline"
                    >
                      Voir l&apos;original
                    </a>
                    <p className="text-muted-foreground">
                      {formatSize(item.sizeBytes)} • {item.width ?? "?"}x{item.height ?? "?"}
                    </p>
                    {item.sourceRef ? (
                      <p className="text-xs text-muted-foreground">Source: {item.sourceRef}</p>
                    ) : null}
                  </div>
                </div>
                <button
                  type="button"
                  className="self-start rounded-md border border-red-300 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(item.id)}
                >
                  Supprimer
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
