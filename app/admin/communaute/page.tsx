import { CommunityPostStatus, CommunityReportStatus } from "@prisma/client";
import { Check, MessageSquare, ShieldAlert } from "lucide-react";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

import { ReportStatusForm } from "./_components/report-status-form";
import { PostStatusForm } from "./_components/post-status-form";

export const metadata: Metadata = {
  title: "Admin - Communauté",
  description: "Modération des signalements des publications communautaires.",
};

const statusLabel: Record<CommunityReportStatus, string> = {
  OPEN: "Ouvert",
  IN_REVIEW: "En revue",
  RESOLVED: "Résolu",
  REJECTED: "Rejeté",
};

const postStatusLabel: Record<CommunityPostStatus, string> = {
  DRAFT: "Brouillon",
  PUBLISHED: "Publié",
  ARCHIVED: "Archivé",
  HIDDEN: "Masqué",
};

const reasonLabel = {
  SPAM: "Spam",
  HARASSMENT: "Harcèlement",
  INSULT: "Insulte",
  OFF_TOPIC: "Hors sujet",
  OTHER: "Autre",
} as const;

const formatDate = (date: Date) =>
  new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export default async function AdminCommunautePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  async function updateReportStatus(formData: FormData) {
    "use server";

    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return;
    }

    const reportId = String(formData.get("reportId") ?? "").trim();
    const status = String(formData.get("status") ?? "").trim() as CommunityReportStatus;

    if (!reportId || !Object.values(CommunityReportStatus).includes(status)) {
      return;
    }

    await prisma.communityReport.update({
      where: { id: reportId },
      data: {
        status,
        reviewedAt: status === CommunityReportStatus.OPEN ? null : new Date(),
      },
    });

    revalidatePath("/admin/communaute");
    revalidatePath("/communaute");
  }

  async function updatePostStatus(formData: FormData) {
    "use server";

    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return;
    }

    const postId = String(formData.get("postId") ?? "").trim();
    const status = String(formData.get("status") ?? "").trim() as CommunityPostStatus;

    if (!postId || !Object.values(CommunityPostStatus).includes(status)) {
      return;
    }

    await prisma.communityPost.update({
      where: { id: postId },
      data: {
        status,
        publishedAt: status === CommunityPostStatus.PUBLISHED ? new Date() : undefined,
      },
    });

    revalidatePath("/admin/communaute");
    revalidatePath("/communaute");
  }

  const reports = await prisma.communityReport.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 100,
    include: {
      reporter: {
        select: {
          name: true,
          email: true,
        },
      },
      post: {
        select: {
          title: true,
          content: true,
        },
      },
    },
  });

  const openReports = reports.filter(
    (report) => report.status === CommunityReportStatus.OPEN,
  ).length;
  const inReviewReports = reports.filter(
    (report) => report.status === CommunityReportStatus.IN_REVIEW,
  ).length;
  const resolvedReports = reports.filter(
    (report) =>
      report.status === CommunityReportStatus.RESOLVED ||
      report.status === CommunityReportStatus.REJECTED,
  ).length;

  const posts = await prisma.communityPost.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 100,
    include: {
      author: {
        select: {
          name: true,
          email: true,
        },
      },
      tournament: {
        select: {
          nom: true,
          tour: true,
        },
      },
    },
  });

  const draftPosts = posts.filter((post) => post.status === CommunityPostStatus.DRAFT).length;

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <header className="rounded-2xl border border-border bg-card px-6 py-7 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Admin · Communauté
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-foreground">Modération des signalements</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground sm:text-base">
          Traitez les signalements des publications communautaires pour garder un espace utile et
          respectueux autour des tours du TFG.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="inline-flex rounded-lg bg-amber-500/10 p-2 text-amber-600">
            <MessageSquare className="h-4 w-4" aria-hidden="true" />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Signalements ouverts</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{openReports}</p>
        </article>

        <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="inline-flex rounded-lg bg-sky-500/10 p-2 text-sky-600">
            <ShieldAlert className="h-4 w-4" aria-hidden="true" />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">En revue</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{inReviewReports}</p>
        </article>

        <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="inline-flex rounded-lg bg-emerald-500/10 p-2 text-emerald-600">
            <Check className="h-4 w-4" aria-hidden="true" />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Traités</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{resolvedReports}</p>
        </article>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-foreground">Publications communauté</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {draftPosts} proposition{draftPosts > 1 ? "s" : ""} en brouillon en attente de validation.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  Date
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Auteur
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Publication
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {posts.map((post) => (
                <tr key={post.id}>
                  <td className="px-4 py-4 align-top text-muted-foreground">
                    {formatDate(post.createdAt)}
                  </td>
                  <td className="px-4 py-4 align-top text-muted-foreground">
                    {post.author.name || post.author.email || "Utilisateur"}
                  </td>
                  <td className="max-w-md px-4 py-4 align-top">
                    <p className="line-clamp-1 font-medium text-foreground">
                      {post.title ?? "Publication sans titre"}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {post.content}
                    </p>
                    {post.tournament ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Tour {post.tournament.tour} · {post.tournament.nom}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="flex flex-col gap-1">
                      <PostStatusForm
                        postId={post.id}
                        status={post.status}
                        updatePostStatus={updatePostStatus}
                      />
                      <span className="text-xs text-muted-foreground">
                        Statut actuel : {postStatusLabel[post.status]}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {posts.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              Aucune publication communautaire n&apos;a encore été créée.
            </div>
          ) : null}
        </div>
      </section>

      <section className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">
                Date
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Publication
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Motif
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Signalé par
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Statut
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {reports.map((report) => (
              <tr key={report.id}>
                <td className="px-4 py-4 align-top text-muted-foreground">
                  {formatDate(report.createdAt)}
                </td>
                <td className="max-w-md px-4 py-4 align-top">
                  <p className="line-clamp-1 font-medium text-foreground">
                    {report.post.title ?? "Publication sans titre"}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {report.post.content}
                  </p>
                </td>
                <td className="px-4 py-4 align-top text-foreground">
                  {reasonLabel[report.reason]}
                </td>
                <td className="px-4 py-4 align-top text-muted-foreground">
                  {report.reporter.name || report.reporter.email || "Utilisateur"}
                </td>
                <td className="px-4 py-4 align-top">
                  <div className="flex flex-col gap-1">
                    <ReportStatusForm
                      reportId={report.id}
                      status={report.status}
                      updateReportStatus={updateReportStatus}
                    />
                    <span className="text-xs text-muted-foreground">
                      Statut actuel : {statusLabel[report.status]}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {reports.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">
            Aucun signalement à traiter pour le moment.
          </div>
        ) : null}
      </section>
    </main>
  );
}
