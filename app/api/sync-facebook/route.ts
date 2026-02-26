import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type FacebookPostResponse = {
  id: string;
  message?: string;
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
            source?: string;
          };
        }>;
      };
    }>;
  };
};

type FacebookApiResponse = {
  data?: FacebookPostResponse[];
  error?: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id?: string;
  };
};

const getImageUrl = (post: FacebookPostResponse): string | null => {
  const firstAttachment = post.attachments?.data?.[0];
  const media = firstAttachment?.media;
  const subAttachmentMedia = firstAttachment?.subattachments?.data?.[0]?.media;

  return (
    media?.image?.src ??
    media?.source ??
    subAttachmentMedia?.image?.src ??
    subAttachmentMedia?.source ??
    null
  );
};

const getFacebookErrorMessage = (payload: FacebookApiResponse, status: number): string => {
  const apiError = payload.error;

  if (!apiError) {
    return `Facebook API request failed with status ${status}`;
  }

  if (apiError.code === 190) {
    return "Token Facebook invalide ou expiré. Générez un token de page valide (permissions pages_read_engagement/pages_read_user_content), puis mettez à jour FACEBOOK_ACCESS_TOKEN.";
  }

  if (apiError.code === 10 || apiError.code === 200) {
    return "Permissions Facebook insuffisantes. Vérifiez les droits du token (lecture de la page et des publications).";
  }

  return apiError.message;
};

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
    const url = new URL(`https://graph.facebook.com/v19.0/${pageId}/feed`);
    url.searchParams.set(
      "fields",
      "id,message,created_time,permalink_url,attachments{media,subattachments{media}}",
    );
    url.searchParams.set("limit", "5");
    url.searchParams.set("access_token", accessToken);

    const response = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
    });

    const payload = (await response.json()) as FacebookApiResponse;

    if (!response.ok || payload.error) {
      const message = getFacebookErrorMessage(payload, response.status);

      return NextResponse.json({ error: message }, { status: 502 });
    }

    const posts = payload.data ?? [];

    await Promise.all(
      posts.map(async (post) => {
        await prisma.facebookPost.upsert({
          where: { id: post.id },
          update: {
            message: post.message ?? null,
            image: getImageUrl(post),
            permalink: post.permalink_url ?? "",
            createdAt: new Date(post.created_time),
            syncedAt: new Date(),
          },
          create: {
            id: post.id,
            message: post.message ?? null,
            image: getImageUrl(post),
            permalink: post.permalink_url ?? "",
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

export async function GET() {
  return syncFacebookPosts();
}

export async function POST() {
  return syncFacebookPosts();
}
