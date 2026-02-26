import type { FacebookPost } from "@prisma/client";
import Image from "next/image";

type FacebookPostCardProps = {
  post: FacebookPost;
};

export function FacebookPostCard({ post }: FacebookPostCardProps) {
  const imageSrc = post.image?.trim() || null;
  const displayText = post.message?.trim() || "Publication partagée";

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-sm">
      {imageSrc ? (
        <div className="relative h-52 w-full">
          <Image
            src={imageSrc}
            alt="Illustration de la publication Facebook"
            fill
            className="object-cover"
            loading="lazy"
            unoptimized
          />
        </div>
      ) : (
        <div className="flex h-52 w-full items-center justify-center bg-muted/50">
          <Image
            src="/default-actualite.svg"
            alt="Illustration par défaut"
            width={160}
            height={160}
            className="h-36 w-36 opacity-80 sm:h-40 sm:w-40"
            loading="lazy"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-4 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {new Date(post.createdAt).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>

        <p className="line-clamp-6 text-sm leading-6 text-foreground/90">{displayText}</p>

        <a
          href={post.permalink}
          target="_blank"
          rel="noreferrer"
          className="mt-auto inline-flex w-fit rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Voir la publication
        </a>
      </div>
    </article>
  );
}
