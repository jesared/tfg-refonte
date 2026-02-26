import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type FacebookPostResponse = {
  id: string;
  message?: string;
  story?: string;
  created_time: string;
  permalink_url?: string;
  attachments?: {
    data?: Array<{
      type?: string;
      target?: {
        id?: string;
      };
      media?: {
        image?: {
          src?: string;
        };
      };
      subattachments?: {
        data?: Array<{
          media?: {
            image?: {
              src?: string;
            };
          };
        }>;
      };
    }>;
  };
};

type FacebookApiResponse = {
  data?: FacebookPostResponse[];
  paging?: {
    next?: string;
  };
  error?: {
    message: string;
    code: number;
  };
};

/* ----------------------------- */
/* Helpers */
/* ----------------------------- */

const normalize = (v?: string) => v?.trim() || null;

const getText = (post: FacebookPostResponse): string | null => {
  return normalize(post.message) ?? normalize(post.story);
};

const getImage = (post: FacebookPostResponse): string | null => {
  const first = post.attachments?.data?.[0];
  if (!first) return null;

  if (first.media?.image?.src) return first.media.image.src;

  const sub = first.subattachments?.data?.[0];
  if (sub?.media?.image?.src) return sub.media.image.src;

  return null;
};

const hasRealContent = (post: FacebookPostResponse) => {
  return Boolean(getText(post) || getImage(post));
};

const getPermalink = (post: FacebookPostResponse) => {
  return normalize(post.permalink_url) ?? `https://www.facebook.com/${post.id}`;
};

/* ----------------------------- */
/* Sync */
/* ----------------------------- */

async function syncFacebookPosts() {
  const token = process.env.FACEBOOK_ACCESS_TOKEN;
  const pageId = process.env.FACEBOOK_PAGE_ID;

  if (!token || !pageId) {
    return NextResponse.json({ error: "Missing Facebook config" }, { status: 500 });
  }

  try {
    const fields =
      "id,created_time,message,story,permalink_url,attachments{type,target,media,subattachments}";

    let nextUrl: string | null =
      `https://graph.facebook.com/v25.0/${pageId}/feed?fields=${encodeURIComponent(fields)}&limit=100&access_token=${encodeURIComponent(token)}`;

    const allPosts: FacebookPostResponse[] = [];

    while (nextUrl) {
      const res = await fetch(nextUrl, { cache: "no-store" });
      const data = (await res.json()) as FacebookApiResponse;

      if (!res.ok || data.error) {
        return NextResponse.json(
          { error: data.error?.message ?? "Facebook error" },
          { status: 502 },
        );
      }

      allPosts.push(...(data.data ?? []));
      nextUrl = data.paging?.next ?? null;
    }

    const filtered = allPosts.filter(hasRealContent);

    await Promise.all(
      filtered.map((post) =>
        prisma.facebookPost.upsert({
          where: { id: post.id },
          update: {
            message: getText(post) ?? "Publication partagée",
            image: getImage(post),
            permalink: getPermalink(post),
            createdAt: new Date(post.created_time),
            syncedAt: new Date(),
          },
          create: {
            id: post.id,
            message: getText(post) ?? "Publication partagée",
            image: getImage(post),
            permalink: getPermalink(post),
            createdAt: new Date(post.created_time),
          },
        }),
      ),
    );

    return NextResponse.json({
      success: true,
      fetched: allPosts.length,
      saved: filtered.length,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}

export async function GET() {
  return syncFacebookPosts();
}

export async function POST() {
  return syncFacebookPosts();
}
