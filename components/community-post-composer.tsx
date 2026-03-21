"use client";

import Image from "next/image";
import { CommunityPostScope } from "@prisma/client";
import { Table2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type TournamentOption = {
  id: string;
  nom: string;
  tour: number;
};

type CommunityPostComposerProps = {
  action: (formData: FormData) => Promise<void>;
  tournaments: TournamentOption[];
};

export function CommunityPostComposer({ action, tournaments }: CommunityPostComposerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadedMediaId, setUploadedMediaId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function deleteUploadedMedia(mediaId: string) {
    const response = await fetch("/api/community/uploads", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mediaId }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(payload?.error ?? "Suppression impossible pour le moment.");
    }
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setUploadError(null);

    if (!file) {
      return;
    }

    const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
    const maxFileSize = 8 * 1024 * 1024;

    if (!allowedMimeTypes.has(file.type)) {
      setUploadError("Type non supporté. Utilisez JPG, PNG, WEBP ou AVIF.");
      event.target.value = "";
      return;
    }

    if (file.size > maxFileSize) {
      setUploadError("Fichier trop volumineux (maximum 8 Mo).");
      event.target.value = "";
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(URL.createObjectURL(file));
    setFileName(file.name);

    const previousMediaId = uploadedMediaId;

    const formData = new FormData();
    formData.set("file", file);

    setIsUploading(true);

    try {
      const response = await fetch("/api/community/uploads", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json().catch(() => null)) as
        | { imageUrl?: string; mediaId?: string; error?: string }
        | null;

      if (!response.ok || !payload?.imageUrl) {
        setUploadedUrl(null);
        setUploadedMediaId(null);
        setUploadError(payload?.error ?? "Upload impossible. Réessayez dans quelques instants.");
        return;
      }

      setUploadedUrl(payload.imageUrl);
      setUploadedMediaId(payload.mediaId ?? null);

      if (previousMediaId && previousMediaId !== payload.mediaId) {
        try {
          await deleteUploadedMedia(previousMediaId);
        } catch {
          setUploadError("Nouvelle image enregistrée, mais suppression de l’ancienne impossible.");
        }
      }
    } catch (error) {
      setUploadedUrl(null);
      setUploadedMediaId(null);
      const message = error instanceof Error ? error.message : "Erreur réseau pendant l'upload.";
      setUploadError(message);
    } finally {
      setIsUploading(false);
    }
  }

  async function removeUploadedImage() {
    setIsRemoving(true);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    try {
      if (uploadedMediaId) {
        await deleteUploadedMedia(uploadedMediaId);
      }

      setUploadedUrl(null);
      setUploadedMediaId(null);
      setPreviewUrl(null);
      setUploadError(null);
      setFileName(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Suppression impossible pour le moment.";
      setUploadError(message);
    } finally {
      setIsRemoving(false);
    }
  }

  return (
    <>
      <div className="rounded-2xl border border-border bg-background/80 p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Table2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="h-11 flex-1 rounded-full border border-input bg-muted/70 px-4 text-left text-sm text-muted-foreground transition hover:bg-muted"
          >
            Quoi de neuf au club ou sur les tours ?
          </button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Votre publication sera enregistrée en brouillon puis validée par un administrateur.
        </p>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-4 shadow-xl sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-foreground sm:text-lg">
                  Nouvelle publication communauté
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Partagez résultats, annonces club et actualités tennis de table.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md border border-input px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted"
              >
                Fermer
              </button>
            </div>

            <form action={action} className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 sm:col-span-2">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Titre (optionnel)
                </span>
                <input
                  type="text"
                  name="title"
                  maxLength={140}
                  placeholder="Ex: Résultats du tour 2 à Reims"
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                />
              </label>

              <label className="flex flex-col gap-1 sm:col-span-2">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Contenu
                </span>
                <textarea
                  name="content"
                  required
                  minLength={12}
                  maxLength={2000}
                  rows={5}
                  placeholder="Partagez une annonce, un résultat ou une info utile à la communauté."
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Type
                </span>
                <select
                  name="scope"
                  defaultValue={CommunityPostScope.TOURNAMENT}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value={CommunityPostScope.TOURNAMENT}>Tournoi</option>
                  <option value={CommunityPostScope.CLUB}>Club</option>
                  <option value={CommunityPostScope.GENERAL}>Général</option>
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Image (optionnel)
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={handleImageUpload}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary-foreground"
                />
                <input type="hidden" name="imageUrl" value={uploadedUrl ?? ""} />
                {isUploading ? (
                  <p className="text-xs text-muted-foreground">Upload en cours...</p>
                ) : null}
                {uploadError ? <p className="text-xs text-destructive">{uploadError}</p> : null}
                {previewUrl ? (
                  <div className="rounded-md border border-border bg-muted/20 p-2">
                    <Image
                      src={previewUrl}
                      alt="Prévisualisation"
                      width={400}
                      height={160}
                      unoptimized
                      className="h-24 w-full rounded object-cover"
                    />
                  </div>
                ) : null}
                {uploadedUrl ? (
                  <p className="text-xs text-emerald-700">Image uploadée avec succès.</p>
                ) : null}
                {fileName ? (
                  <p className="text-xs text-muted-foreground">Fichier : {fileName}</p>
                ) : null}
                {previewUrl || uploadedUrl ? (
                  <button
                    type="button"
                    onClick={() => {
                      void removeUploadedImage();
                    }}
                    disabled={isRemoving}
                    className="w-fit rounded-md border border-input px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted"
                  >
                    {isRemoving ? "Suppression..." : "Retirer l&apos;image"}
                  </button>
                ) : null}
              </label>

              <label className="flex flex-col gap-1 sm:col-span-2">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Tournoi lié (optionnel)
                </span>
                <select
                  name="tournamentId"
                  defaultValue=""
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Aucun tournoi spécifique</option>
                  {tournaments.map((tournament) => (
                    <option key={tournament.id} value={tournament.id}>
                      Tour {tournament.tour} · {tournament.nom}
                    </option>
                  ))}
                </select>
              </label>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={isUploading || isRemoving}
                  className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                >
                  {isUploading || isRemoving ? "Patientez..." : "Envoyer pour validation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
