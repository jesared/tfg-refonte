import type { FacebookPost } from "@prisma/client";
import Image from "next/image";

type FacebookPostCardProps = {
  post: FacebookPost;
};

export function FacebookPostCard({ post }: FacebookPostCardProps) {
  const imageSrc = post.image?.trim() || null;

  const displayText =
    post.message?.trim() ||
    (post.type === "share" && "Publication partagée") ||
    (post.type === "event" && "Nouvel événement publié") ||
    "Publication";

  const badgeLabel = post.type === "event" ? "Événement" : post.type === "share" ? "Partage" : null;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-sm transition hover:shadow-md">
      {/* IMAGE */}
      <div className="relative h-52 w-full">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt="Illustration Facebook"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
            priority={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted/50">
            <Image
              src="/default-actualite.svg"
              alt="Illustration par défaut"
              width={320}
              height={320}
              className="opacity-60"
            />
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {new Date(post.createdAt).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>

          {badgeLabel && (
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {badgeLabel}
            </span>
          )}
        </div>

        <p className="line-clamp-6 text-sm leading-6 text-foreground/90">{displayText}</p>

        <a
          href={post.permalink}
          target="_blank"
          rel="noreferrer"
          className="mt-auto inline-flex w-fit rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          Voir la publication
        </a>
      </div>
    </article>
  );
}
