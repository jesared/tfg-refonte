# Facebook token diagnostic

Run this command in the same environment where `/api/sync-facebook` executes (staging/prod runtime):

```bash
npm run facebook:debug-token
```

The command prints:

- Which token source is used by sync (`FACEBOOK_PAGE_ACCESS_TOKEN` first, fallback to `FACEBOOK_ACCESS_TOKEN`).
- Whether required env vars are loaded.
- Facebook `debug_token` fields: `is_valid`, `expires_at`, `scopes`, `granular_scopes`, and `app_id`.

> Note: tokens are masked in the output, but still avoid sharing logs publicly.
