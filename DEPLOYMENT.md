# Deploying GasTrack

Production host: **Cloudflare Pages** (`@sveltejs/adapter-cloudflare`) at
`https://gastrack.elmoldasoft.us`.

## 1. Cloudflare Pages (Git integration)

Cloudflare’s CLI is **Wrangler** (`npx wrangler`). Mental model vs `gcloud`:

| Goal | gcloud | Wrangler |
|------|--------|----------|
| Auth | `gcloud auth login` | `npx wrangler login` |
| Create app | `gcloud run deploy …` / create service | `npx wrangler pages project create gastrack` |
| Wire source → Git | mostly CLI | **Dashboard only** (Wrangler cannot attach GitHub yet) |
| Push deploys | Cloud Build / Cloud Run from Git | Pages builds on push after Git is connected |
| One-off upload | `gcloud run deploy` | `npm run pages:deploy` (Direct Upload) |

**Git attach is the one step you must do in the UI.** Create the project with
CLI if you want, then connect the repo in the dashboard.

```sh
npx wrangler login
npx wrangler pages project create gastrack --production-branch=main
# secrets (interactive; one at a time):
npx wrangler pages secret put DATABASE_URL --project-name=gastrack
npx wrangler pages secret put BETTER_AUTH_SECRET --project-name=gastrack
# … BETTER_AUTH_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
```

Then in the dashboard → **Workers & Pages** → **gastrack** → **Settings → Builds**:

1. **Connect Git** → GitHub → `elMolda/gastrack` (install Cloudflare GitHub App if prompted).
2. Build settings (classic Pages — **no** separate deploy command):
   - Build command: `npm run build`
   - Build output directory: `.svelte-kit/cloudflare`
   - Root / path: `/`
3. Custom domains → `gastrack.elmoldasoft.us`

Avoid the newer “Workers Builds” flow that asks for `npx wrangler deploy` +
`CLOUDFLARE_API_TOKEN` — that’s what failed earlier. Use **Pages** Git builds
that publish `.svelte-kit/cloudflare` directly.

Do **not** set `CLOUDFLARE_API_TOKEN` as an app env var unless the token has
**Cloudflare Pages → Edit**.

App code reads secrets via `$env/dynamic/private` (runtime). Encrypted Pages
vars are fine — they do not need to be present at build time.

Optional Direct Upload (skip Git): `npm run build && npm run pages:deploy`.

## 2. Neon migrations

Run once against Neon before (or right after) the first deploy:

```sh
DATABASE_URL='postgresql://…neon…' npm run db:migrate
```

## 3. Google OAuth

Authorized redirect URI:

```text
https://gastrack.elmoldasoft.us/api/auth/callback/google
```

Privacy policy URL: `https://gastrack.elmoldasoft.us/privacy`

## 4. Custom domain

In Cloudflare Pages → Custom domains, add `gastrack.elmoldasoft.us`
(zone already on Cloudflare).

Full cutover checklist lives in issue #9 / `docs/migration-neon-better-auth.md` §13 phase 8.
