"use client";

type DriveImageProps = {
  fileId: string;
  alt?: string;
  className?: string;
};

export function DriveImage({ fileId, alt, className }: DriveImageProps) {
  const src = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;

  return (
    <img
      src={src}
      alt={alt ?? "Image Google Drive"}
      className={className}
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  );
}
