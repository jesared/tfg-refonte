import type { FacebookPost } from "@prisma/client";

type FacebookPostCardProps = {
  post: FacebookPost;
};

export function FacebookPostCard({ post }: FacebookPostCardProps) {
  const imageSrc = post.image?.trim() || "/logo.png";

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-sm">
      <img
        src={imageSrc}
        alt="Illustration de la publication Facebook"
        className="h-52 w-full object-cover"
        loading="lazy"
      />

      <div className="flex flex-1 flex-col gap-4 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {new Date(post.createdAt).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>

        <p className="line-clamp-6 text-sm leading-6 text-foreground/90">
          {post.message?.trim() || "Consultez la publication complète sur Facebook."}
        </p>

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
