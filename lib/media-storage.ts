const REQUIRED_ENV = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_STORAGE_BUCKET",
] as const;

export function assertStorageConfig() {
  const missing = REQUIRED_ENV.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    throw new Error(`Configuration stockage Supabase manquante: ${missing.join(", ")}`);
  }
}

export function buildMediaKeys(filenameBase: string) {
  const prefix = process.env.SUPABASE_MEDIA_PREFIX?.replace(/^\/+|\/+$/g, "") || "admin-media";

  return {
    originalKey: `${prefix}/original/${filenameBase}.webp`,
    thumbnailKey: `${prefix}/thumb/${filenameBase}.webp`,
  };
}

function getSupabaseConfig() {
  assertStorageConfig();

  return {
    url: process.env.SUPABASE_URL!.replace(/\/$/, ""),
    key: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    bucket: process.env.SUPABASE_STORAGE_BUCKET!,
  };
}

function resolvePublicUrl(key: string) {
  const { url, bucket } = getSupabaseConfig();
  const publicBase = process.env.SUPABASE_PUBLIC_URL_BASE;

  if (publicBase) {
    return `${publicBase.replace(/\/$/, "")}/${key}`;
  }

  return `${url}/storage/v1/object/public/${bucket}/${key}`;
}

export async function uploadObject(params: { key: string; body: Buffer; contentType: string }) {
  const { url, key: serviceRoleKey, bucket } = getSupabaseConfig();
  const objectUrl = `${url}/storage/v1/object/${bucket}/${params.key}`;

  const response = await fetch(objectUrl, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": params.contentType,
      "x-upsert": "false",
    },
    body: new Blob([Uint8Array.from(params.body)]),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Supabase upload failed (${response.status}): ${details.slice(0, 500)}`);
  }

  return {
    bucket,
    publicUrl: resolvePublicUrl(params.key),
  };
}

export async function deleteObject(key: string) {
  const { url, bucket, key: serviceRoleKey } = getSupabaseConfig();
  const objectUrl = `${url}/storage/v1/object/${bucket}/${key}`;

  const response = await fetch(objectUrl, {
    method: "DELETE",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Supabase delete failed (${response.status}): ${details.slice(0, 500)}`);
  }
}
