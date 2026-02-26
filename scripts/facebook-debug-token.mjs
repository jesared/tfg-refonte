#!/usr/bin/env node

const required = ["FACEBOOK_APP_ID", "FACEBOOK_APP_SECRET"];

const maskToken = (value) => {
  if (!value) return null;
  if (value.length <= 12) return "*".repeat(value.length);
  return `${value.slice(0, 6)}...${value.slice(-6)}`;
};

const getEnvSummary = () => {
  const pageToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN || null;
  const userToken = process.env.FACEBOOK_ACCESS_TOKEN || null;

  return {
    NODE_ENV: process.env.NODE_ENV || null,
    FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID || null,
    FACEBOOK_APP_SECRET_SET: Boolean(process.env.FACEBOOK_APP_SECRET),
    FACEBOOK_PAGE_ID: process.env.FACEBOOK_PAGE_ID || null,
    FACEBOOK_PAGE_ACCESS_TOKEN_SET: Boolean(pageToken),
    FACEBOOK_PAGE_ACCESS_TOKEN_MASKED: maskToken(pageToken),
    FACEBOOK_ACCESS_TOKEN_SET: Boolean(userToken),
    FACEBOOK_ACCESS_TOKEN_MASKED: maskToken(userToken),
    TOKEN_SOURCE_USED_BY_SYNC: pageToken ? "FACEBOOK_PAGE_ACCESS_TOKEN" : "FACEBOOK_ACCESS_TOKEN",
  };
};

const readJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const debugToken = async ({ token, appAccessToken, label }) => {
  if (!token) {
    return { label, skipped: true, reason: "missing token" };
  }

  const url = new URL("https://graph.facebook.com/debug_token");
  url.searchParams.set("input_token", token);
  url.searchParams.set("access_token", appAccessToken);

  const response = await fetch(url.toString(), { method: "GET", cache: "no-store" });
  const payload = await readJson(response);

  const data = payload?.data;

  return {
    label,
    httpStatus: response.status,
    ok: response.ok,
    graphError: payload?.error || null,
    is_valid: data?.is_valid ?? null,
    app_id: data?.app_id ?? null,
    type: data?.type ?? null,
    expires_at: data?.expires_at ?? null,
    scopes: data?.scopes ?? [],
    granular_scopes: data?.granular_scopes ?? [],
  };
};

const run = async () => {
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    console.error(`Missing required env: ${missing.join(", ")}`);
    process.exit(1);
  }

  const envSummary = getEnvSummary();
  const appAccessToken = `${process.env.FACEBOOK_APP_ID}|${process.env.FACEBOOK_APP_SECRET}`;

  const checks = await Promise.all([
    debugToken({
      label: "FACEBOOK_PAGE_ACCESS_TOKEN",
      token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN || null,
      appAccessToken,
    }),
    debugToken({
      label: "FACEBOOK_ACCESS_TOKEN",
      token: process.env.FACEBOOK_ACCESS_TOKEN || null,
      appAccessToken,
    }),
  ]);

  console.log(JSON.stringify({ envSummary, checks }, null, 2));
};

run().catch((error) => {
  console.error("facebook-debug-token failed", error);
  process.exit(1);
});
