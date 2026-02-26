import Image from "next/image";

type FacebookPostCardProps = {
  message?: string;
  image?: string;
  permalink: string;
  createdAt: Date;
};

export default function FacebookPostCard({
  message,
  image,
  permalink,
  createdAt,
}: FacebookPostCardProps) {
  const formattedDate = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(createdAt);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-transform duration-300 hover:scale-[1.01] hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/40">
      {image ? (
        <div className="relative h-56 w-full bg-slate-100 dark:bg-slate-800">
          <Image
            src={image}
            alt="Image de la publication Facebook"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      ) : null}

      <div className="space-y-4 p-5">
        <p className="text-sm text-slate-500 dark:text-slate-400">{formattedDate}</p>

        {message ? (
          <p className="line-clamp-4 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            {message}
          </p>
        ) : (
          <p className="text-sm italic text-slate-400 dark:text-slate-500">
            Aucun message disponible.
          </p>
        )}

        <a
          href={permalink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-400 dark:focus-visible:ring-offset-slate-900"
        >
          Voir sur Facebook
        </a>
      </div>
    </article>
  );
}
