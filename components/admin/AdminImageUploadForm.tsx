"use client";

import { useState } from "react";

type UploadResponse = {
  message: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function formatSize(size: number) {
  return `${(size / (1024 * 1024)).toFixed(2)} Mo`;
}

export function AdminImageUploadForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData(event.currentTarget);
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      setError("Sélectionne une image avant de lancer l'upload.");
      setIsLoading(false);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Le fichier dépasse 5 Mo. Réduis l'image puis réessaie.");
      setIsLoading(false);
      return;
    }

    const response = await fetch("/api/admin/uploads", {
      method: "POST",
      body: formData,
    });

    const payload = (await response.json().catch(() => null)) as
      | UploadResponse
      | { error?: string }
      | null;

    if (!response.ok) {
      setError(payload && "error" in payload ? payload.error ?? "Upload impossible." : "Upload impossible.");
      setIsLoading(false);
      return;
    }

    if (!payload || !("url" in payload)) {
      setError("Réponse serveur invalide.");
      setIsLoading(false);
      return;
    }

    setResult(payload);
    setPreviewUrl(payload.url);
    event.currentTarget.reset();
    setIsLoading(false);
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">Uploader une image (admin)</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        MVP local : JPG, PNG, WEBP, taille max 5 Mo. Les fichiers sont stockés dans
        <code className="ml-1 rounded bg-muted px-1 py-0.5 text-xs">public/uploads/admin</code>.
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
            accept="image/jpeg,image/png,image/webp"
            className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground"
            required
          />
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

      {result ? (
        <div className="mt-5 space-y-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-medium">{result.message}</p>
          <p>
            URL publique :
            <a href={result.url} target="_blank" rel="noreferrer" className="ml-1 font-semibold underline">
              {result.url}
            </a>
          </p>
          <p>
            Type: {result.mimeType} • Taille: {formatSize(result.size)}
          </p>
        </div>
      ) : null}

      {previewUrl ? (
        <div className="mt-5 rounded-xl border border-border/70 bg-muted/20 p-4">
          <p className="mb-3 text-sm font-medium text-foreground">Aperçu</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Aperçu de l'image uploadée"
            className="max-h-72 w-auto rounded-lg border border-border object-contain"
          />
        </div>
      ) : null}
    </section>
  );
}
