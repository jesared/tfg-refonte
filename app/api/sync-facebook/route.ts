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
      media?: {
        image?: {
          src?: string;
        };
        source?: string;
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
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id?: string;
  };
};

/* ----------------------------- */
/* Helpers */
/* ----------------------------- */

const normalizeText = (value?: string): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const getDisplayMessage = (post: FacebookPostResponse): string => {
  return normalizeText(post.message) ?? normalizeText(post.story) ?? "Publication partagée";
};

const getPermalink = (post: FacebookPostResponse): string => {
  if (post.permalink_url?.trim()) {
    return post.permalink_url;
  }

  return `https://www.facebook.com/${post.id}`;
};

const getImageUrl = (post: FacebookPostResponse): string | null => {
  const first = post.attachments?.data?.[0];
  if (!first) return null;

  // Image classique
  if (first.media?.image?.src) {
    return first.media.image.src;
  }

  // Image via subattachments (partages, albums, etc.)
  const sub = first.subattachments?.data?.[0];
  if (sub?.media?.image?.src) {
    return sub.media.image.src;
  }

  return null;
};

const getFacebookErrorMessage = (payload: FacebookApiResponse, status: number): string => {
  const apiError = payload.error;

  if (!apiError) {
    return `Facebook API request failed with status ${status}`;
  }

  if (apiError.code === 190) {
    return "Token Facebook invalide ou expiré. Générez un nouveau Page Access Token.";
  }

  if (apiError.code === 10 || apiError.code === 200) {
    return "Permissions Facebook insuffisantes. Vérifiez les droits pages_read_engagement/pages_read_user_content.";
  }

  return apiError.message;
};

/* ----------------------------- */
/* Sync Function */
/* ----------------------------- */

async function syncFacebookPosts() {
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
  const pageId = process.env.FACEBOOK_PAGE_ID;

  if (!accessToken || !pageId) {
    return NextResponse.json(
      { error: "Missing FACEBOOK_ACCESS_TOKEN or FACEBOOK_PAGE_ID" },
      { status: 500 },
    );
  }

  try {
    const fields = "id,created_time,message,story,permalink_url,attachments{media,subattachments}";
    const posts: FacebookPostResponse[] = [];

    let nextUrl: string | null =
      `https://graph.facebook.com/v25.0/${pageId}/posts?fields=${encodeURIComponent(
        fields,
      )}&limit=100&access_token=${encodeURIComponent(accessToken)}`;

    while (nextUrl) {
      const response = await fetch(nextUrl, {
        method: "GET",
        cache: "no-store",
      });

      const payload = (await response.json()) as FacebookApiResponse;

      if (!response.ok || payload.error) {
        const message = getFacebookErrorMessage(payload, response.status);
        return NextResponse.json({ error: message }, { status: 502 });
      }

      posts.push(...(payload.data ?? []));
      nextUrl = payload.paging?.next ?? null;
    }

    await Promise.all(
      posts.map(async (post) => {
        await prisma.facebookPost.upsert({
          where: { id: post.id },
          update: {
            message: getDisplayMessage(post),
            image: getImageUrl(post),
            permalink: getPermalink(post),
            createdAt: new Date(post.created_time),
            syncedAt: new Date(),
          },
          create: {
            id: post.id,
            message: getDisplayMessage(post),
            image: getImageUrl(post),
            permalink: getPermalink(post),
            createdAt: new Date(post.created_time),
          },
        });
      }),
    );

    return NextResponse.json({ success: true, count: posts.length });
  } catch (error) {
    console.error("Error syncing Facebook posts:", error);

    return NextResponse.json({ error: "Failed to sync Facebook posts" }, { status: 500 });
  }
}

/* ----------------------------- */
/* Route Exports */
/* ----------------------------- */

export async function GET() {
  return syncFacebookPosts();
}

export async function POST() {
  return syncFacebookPosts();
}
