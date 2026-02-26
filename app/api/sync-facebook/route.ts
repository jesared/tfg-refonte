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
  };
};

type FacebookPageTokenResponse = {
  data?: Array<{
    id: string;
    access_token?: string;
  }>;
  error?: FacebookApiResponse["error"];
};

type FacebookTokenExchangeResponse = {
  access_token?: string;
  token_type?: string;
  error?: FacebookApiResponse["error"];
};

/* ----------------------------- */
/* Helpers */
/* ----------------------------- */

const normalizeText = (value?: string): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const getDisplayMessage = (post: FacebookPostResponse): string | null => {
  return normalizeText(post.message) ?? normalizeText(post.story);
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

  if (first.media?.image?.src) {
    return first.media.image.src;
  }

  const sub = first.subattachments?.data?.[0];
  if (sub?.media?.image?.src) {
    return sub.media.image.src;
  }

  return null;
};

const hasRealContent = (post: FacebookPostResponse): boolean => {
  const text = getDisplayMessage(post);
  const image = getImageUrl(post);

  return Boolean(text || image);
};

const getFacebookErrorMessage = (payload: FacebookApiResponse, status: number): string => {
  if (!payload.error) {
    return `Facebook API request failed with status ${status}`;
  }

  if (payload.error.code === 190) {
    if (payload.error.error_subcode === 463) {
      return "Token Facebook expiré. Générez un nouveau token longue durée puis relancez la synchronisation.";
    }

    return "Token Facebook invalide ou expiré.";
  }

  if (payload.error.code === 10 || payload.error.code === 200) {
    return "Permissions Facebook insuffisantes.";
  }

  return payload.error.message;
};

const exchangeForLongLivedUserToken = async (
  userToken: string,
  appId: string,
  appSecret: string,
): Promise<string | null> => {
  const url = new URL("https://graph.facebook.com/v25.0/oauth/access_token");
  url.searchParams.set("grant_type", "fb_exchange_token");
  url.searchParams.set("client_id", appId);
  url.searchParams.set("client_secret", appSecret);
  url.searchParams.set("fb_exchange_token", userToken);

  const response = await fetch(url.toString(), { method: "GET", cache: "no-store" });
  const payload = (await response.json()) as FacebookTokenExchangeResponse;

  if (!response.ok || payload.error || !payload.access_token) {
    return null;
  }

  return payload.access_token;
};

const getPageAccessToken = async (userToken: string, pageId: string): Promise<string | null> => {
  const url = new URL("https://graph.facebook.com/v25.0/me/accounts");
  url.searchParams.set("fields", "id,access_token");
  url.searchParams.set("access_token", userToken);

  const response = await fetch(url.toString(), { method: "GET", cache: "no-store" });
  const payload = (await response.json()) as FacebookPageTokenResponse;

  if (!response.ok || payload.error || !payload.data?.length) {
    return null;
  }

  const page = payload.data.find((entry) => entry.id === pageId);
  return page?.access_token ?? null;
};

/* ----------------------------- */
/* Sync Function */
/* ----------------------------- */

async function syncFacebookPosts() {
  const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN ?? process.env.FACEBOOK_ACCESS_TOKEN;
  const fallbackUserToken = process.env.FACEBOOK_ACCESS_TOKEN;
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;

  if (!accessToken || !pageId) {
    return NextResponse.json(
      {
        error:
          "Missing FACEBOOK_PAGE_ACCESS_TOKEN (or FACEBOOK_ACCESS_TOKEN) or FACEBOOK_PAGE_ID",
      },
      { status: 500 },
    );
  }

  try {
    const fields = "id,created_time,message,story,permalink_url,attachments{media,subattachments}";
    const posts: FacebookPostResponse[] = [];
    let tokenToUse = accessToken;
    let retryWithRefreshedToken = true;

    const buildFeedUrl = (token: string): string =>
      `https://graph.facebook.com/v25.0/${pageId}/feed?fields=${encodeURIComponent(
        fields,
      )}&limit=100&access_token=${encodeURIComponent(token)}`;

    let nextUrl: string | null = buildFeedUrl(tokenToUse);

    while (nextUrl) {
      const response = await fetch(nextUrl, {
        method: "GET",
        cache: "no-store",
      });

      const payload = (await response.json()) as FacebookApiResponse;

      if (!response.ok || payload.error) {
        const canRefreshToken =
          payload.error?.code === 190 &&
          retryWithRefreshedToken &&
          Boolean(fallbackUserToken && appId && appSecret);

        if (canRefreshToken && fallbackUserToken && appId && appSecret) {
          retryWithRefreshedToken = false;

          const longLivedToken = await exchangeForLongLivedUserToken(
            fallbackUserToken,
            appId,
            appSecret,
          );

          if (longLivedToken) {
            const refreshedPageToken = await getPageAccessToken(longLivedToken, pageId);

            if (refreshedPageToken) {
              tokenToUse = refreshedPageToken;
              posts.length = 0;
              nextUrl = buildFeedUrl(tokenToUse);
              continue;
            }
          }
        }

        const message = getFacebookErrorMessage(payload, response.status);
        return NextResponse.json({ error: message }, { status: 502 });
      }

      posts.push(...(payload.data ?? []));
      nextUrl = payload.paging?.next ?? null;
    }

    // 🔥 Filtrage intelligent ici
    const filteredPosts = posts.filter(hasRealContent);

    await Promise.all(
      filteredPosts.map(async (post) => {
        await prisma.facebookPost.upsert({
          where: { id: post.id },
          update: {
            message: getDisplayMessage(post) ?? "Publication partagée",
            image: getImageUrl(post),
            permalink: getPermalink(post),
            createdAt: new Date(post.created_time),
            syncedAt: new Date(),
          },
          create: {
            id: post.id,
            message: getDisplayMessage(post) ?? "Publication partagée",
            image: getImageUrl(post),
            permalink: getPermalink(post),
            createdAt: new Date(post.created_time),
          },
        });
      }),
    );

    return NextResponse.json({
      success: true,
      totalFetched: posts.length,
      totalSaved: filteredPosts.length,
    });
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
