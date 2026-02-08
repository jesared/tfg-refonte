"use client";

import { useState } from "react";

type DriveImageLightboxProps = {
  fileId: string;
  alt: string;
  thumbClassName?: string;
};

export function DriveImageLightbox({ fileId, alt, thumbClassName }: DriveImageLightboxProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(false);

  const src = `https://drive.google.com/uc?export=view&id=${fileId}`;

  if (error) {
    return (
      <div className="rounded-md border border-dashed p-4 text-xs text-muted-foreground">
        Image indisponible
      </div>
    );
  }

  return (
    <>
      {/* Thumbnail */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onClick={() => setOpen(true)}
        onError={() => setError(true)}
        className={`cursor-zoom-in ${thumbClassName}`}
      />

      {/* Lightbox */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setOpen(false)}
        >
          <img
            src={src}
            alt={alt}
            className="max-h-[90vh] max-w-[90vw] rounded-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
