import { createHash, createHmac } from "node:crypto";

const REQUIRED_ENV = ["S3_ENDPOINT", "S3_REGION", "S3_BUCKET", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY"] as const;

type HttpMethod = "PUT" | "DELETE";

function toHexSha256(value: Buffer | string) {
  return createHash("sha256").update(value).digest("hex");
}

function hmac(key: Buffer | string, value: string) {
  return createHmac("sha256", key).update(value).digest();
}

function getTimestamp(date = new Date()) {
  const iso = date.toISOString().replace(/[:-]|\.\d{3}/g, "");
  return { amzDate: iso, dateStamp: iso.slice(0, 8) };
}

function buildSigningKey(secret: string, dateStamp: string, region: string, service: string) {
  const kDate = hmac(`AWS4${secret}`, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  return hmac(kService, "aws4_request");
}

function getObjectUrl(key: string) {
  const endpoint = new URL(process.env.S3_ENDPOINT!);
  const bucket = process.env.S3_BUCKET!;
  const usePathStyle = process.env.S3_FORCE_PATH_STYLE === "true";

  if (usePathStyle) {
    return new URL(`/${bucket}/${key}`, endpoint);
  }

  return new URL(`https://${bucket}.${endpoint.host}/${key}`);
}

async function signedRequest(method: HttpMethod, key: string, body?: Buffer, contentType?: string) {
  assertStorageConfig();

  const region = process.env.S3_REGION!;
  const service = "s3";
  const accessKey = process.env.S3_ACCESS_KEY_ID!;
  const secretKey = process.env.S3_SECRET_ACCESS_KEY!;

  const url = getObjectUrl(key);
  const { amzDate, dateStamp } = getTimestamp();
  const payloadHash = toHexSha256(body ?? "");
  const canonicalUri = url.pathname;

  const canonicalHeadersObj: Record<string, string> = {
    host: url.host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  };

  if (contentType) {
    canonicalHeadersObj["content-type"] = contentType;
  }

  const signedHeaders = Object.keys(canonicalHeadersObj).sort();
  const canonicalHeaders = signedHeaders
    .map((header) => `${header}:${canonicalHeadersObj[header].trim()}\n`)
    .join("");

  const canonicalRequest = [
    method,
    canonicalUri,
    "",
    canonicalHeaders,
    signedHeaders.join(";"),
    payloadHash,
  ].join("\n");

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    toHexSha256(canonicalRequest),
  ].join("\n");

  const signingKey = buildSigningKey(secretKey, dateStamp, region, service);
  const signature = createHmac("sha256", signingKey).update(stringToSign).digest("hex");

  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders.join(";")}, Signature=${signature}`;

  const headers = new Headers({
    Authorization: authorization,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  });

  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? new Uint8Array(body) : undefined,
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`S3 ${method} failed (${response.status}): ${details.slice(0, 500)}`);
  }
}

export function assertStorageConfig() {
  const missing = REQUIRED_ENV.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    throw new Error(`Configuration stockage manquante: ${missing.join(", ")}`);
  }
}

export function buildMediaKeys(filenameBase: string) {
  return {
    originalKey: `admin-media/original/${filenameBase}.webp`,
    thumbnailKey: `admin-media/thumb/${filenameBase}.webp`,
  };
}

export async function uploadObject(params: {
  key: string;
  body: Buffer;
  contentType: string;
}) {
  await signedRequest("PUT", params.key, params.body, params.contentType);

  const bucket = process.env.S3_BUCKET!;
  const base = process.env.S3_PUBLIC_URL_BASE;

  if (base) {
    return {
      bucket,
      publicUrl: `${base.replace(/\/$/, "")}/${params.key}`,
    };
  }

  const endpoint = process.env.S3_ENDPOINT!.replace(/\/$/, "");
  const usePathStyle = process.env.S3_FORCE_PATH_STYLE === "true";

  return {
    bucket,
    publicUrl: usePathStyle
      ? `${endpoint}/${bucket}/${params.key}`
      : `${endpoint.replace("https://", `https://${bucket}.`)}/${params.key}`,
  };
}

export async function deleteObject(key: string) {
  await signedRequest("DELETE", key);
}
