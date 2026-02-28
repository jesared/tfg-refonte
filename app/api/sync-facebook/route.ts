import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type FacebookPostResponse = {
  id: string;
  is_published?: boolean;
  message?: string;
  story?: string;
  created_time: string;
  permalink_url?: string;
  attachments?: {
    data?: Array<{
      type?: string;
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

type FacebookGraphError = {
  message: string;
  code: number;
  error_subcode?: number;
};

type FacebookApiResponse = {
  data?: FacebookPostResponse[];
  paging?: {
    next?: string;
  };
  error?: FacebookGraphError;
};

type FacebookAccountsApiResponse = {
  data?: Array<{
    id?: string;
    access_token?: string;
  }>;
  error?: FacebookGraphError;
};

/* ----------------------------- */
/* Helpers */
/* ----------------------------- */

const normalize = (v?: string) => v?.trim() || null;

const getText = (post: FacebookPostResponse): string | null =>
  normalize(post.message) ?? normalize(post.story);

const getImage = (post: FacebookPostResponse): string | null => {
  const first = post.attachments?.data?.[0];
  if (!first) return null;

  if (first.media?.image?.src) return first.media.image.src;

  const sub = first.subattachments?.data?.[0];
  if (sub?.media?.image?.src) return sub.media.image.src;

  return null;
};

const getType = (post: FacebookPostResponse): string => {
  const type = post.attachments?.data?.[0]?.type;

  if (type === "event") return "event";
  if (type === "share") return "share";
  if (type === "video") return "video";

  return "post";
};

const isSystemStory = (post: FacebookPostResponse): boolean => {
  const story = post.story?.toLowerCase() ?? "";

  return (
    story.includes("a actualisé son statut") ||
    story.includes("a mis à jour") ||
    story.includes("a changé") ||
    story.includes("updated") ||
    story.includes("profile picture")
  );
};

const hasRealContent = (post: FacebookPostResponse): boolean => Boolean(getText(post) || getImage(post));

const isPublishedPost = (post: FacebookPostResponse): boolean => post.is_published !== false;

const getPermalink = (post: FacebookPostResponse) =>
  normalize(post.permalink_url) ?? `https://www.facebook.com/${post.id}`;


async function fetchPageAccessTokenFromUserToken(params: {
  pageId: string;
  userToken: string;
}): Promise<{ token?: string; error?: FacebookGraphError }> {
  const url = `https://graph.facebook.com/v25.0/me/accounts?fields=id,access_token&limit=200&access_token=${encodeURIComponent(
    params.userToken,
  )}`;

  const res = await fetch(url, { cache: "no-store" });
  const data = (await res.json()) as FacebookAccountsApiResponse;

  if (!res.ok || data.error) {
    return {
      error: data.error ?? {
        message: "Facebook error",
        code: res.status,
      },
    };
  }

  const matched = data.data?.find((account) => normalize(account.id) === params.pageId);
  const token = normalize(matched?.access_token);

  if (!token) {
    return {
      error: {
        message: `Page ${params.pageId} not found in /me/accounts response`,
        code: 404,
      },
    };
  }

  return { token };
}

async function fetchFacebookFeed(params: {
  pageId: string;
  token: string;
  fields: string;
}): Promise<{ allPosts: FacebookPostResponse[]; error?: FacebookGraphError }> {
  let nextUrl: string | null = `https://graph.facebook.com/v25.0/${params.pageId}/feed?fields=${encodeURIComponent(
    params.fields,
  )}&limit=50&access_token=${encodeURIComponent(params.token)}`;

  const allPosts: FacebookPostResponse[] = [];

  while (nextUrl) {
    const res = await fetch(nextUrl, { cache: "no-store" });
    const data = (await res.json()) as FacebookApiResponse;

    if (!res.ok || data.error) {
      return {
        allPosts,
        error: data.error ?? {
          message: "Facebook error",
          code: res.status,
        },
      };
    }

    allPosts.push(...(data.data ?? []));
    nextUrl = data.paging?.next ?? null;
  }

  return { allPosts };
}

/* ----------------------------- */
/* Sync */
/* ----------------------------- */

async function syncFacebookPosts() {
  const pageId = normalize(process.env.FACEBOOK_PAGE_ID);
  const pageToken = normalize(process.env.FACEBOOK_PAGE_ACCESS_TOKEN);
  const userToken = normalize(process.env.FACEBOOK_ACCESS_TOKEN);

  if (!pageId || (!pageToken && !userToken)) {
    return NextResponse.json({ error: "Missing Facebook config" }, { status: 500 });
  }

  try {
    const fields =
      "id,is_published,created_time,message,story,permalink_url,attachments{type,media,subattachments}";

    let derivedPageToken: string | null = null;

    if (userToken) {
      const pageTokenResult = await fetchPageAccessTokenFromUserToken({ pageId, userToken });

      if (pageTokenResult.token) {
        derivedPageToken = pageTokenResult.token;
      }
    }

    const rawTokens = [derivedPageToken, pageToken, userToken];
    const seen = new Set<string>();
    const accessTokens: string[] = [];

    for (const maybeToken of rawTokens) {
      if (!maybeToken || seen.has(maybeToken)) continue;
      seen.add(maybeToken);
      accessTokens.push(maybeToken);
    }

    let allPosts: FacebookPostResponse[] = [];
    let lastError: FacebookGraphError | undefined;

    for (const token of accessTokens) {
      const result = await fetchFacebookFeed({ pageId, token, fields });

      if (!result.error) {
        allPosts = result.allPosts;
        lastError = undefined;
        break;
      }
    }

      lastError = result.error;
    }

    if (lastError) {
      return NextResponse.json(
        {
          error: lastError.message ?? "Facebook error",
          code: lastError.code ?? null,
          subcode: lastError.error_subcode ?? null,
        },
        { status: 502 },
      );
    }

    // 🔥 FILTRE UX PROPRE
    const filtered = allPosts.filter(
      (post) => isPublishedPost(post) && hasRealContent(post) && !isSystemStory(post),
    );

    await Promise.all(
      filtered.map((post) =>
        prisma.facebookPost.upsert({
          where: { id: post.id },
          update: {
            message: getText(post) ?? "Publication",
            image: getImage(post),
            permalink: getPermalink(post),
            type: getType(post),
            createdAt: new Date(post.created_time),
            syncedAt: new Date(),
          },
          create: {
            id: post.id,
            message: getText(post) ?? "Publication",
            image: getImage(post),
            permalink: getPermalink(post),
            type: getType(post),
            createdAt: new Date(post.created_time),
          },
        }),
      ),
    );
    // 🧹 SUPPRESSION MIRROIR
    const facebookIds = filtered.map((post) => post.id);

    await prisma.facebookPost.deleteMany({
      where: {
        id: {
          notIn: facebookIds,
        },
      },
    });
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
