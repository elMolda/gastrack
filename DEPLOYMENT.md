# Deploying GasTrack

Production host: **Cloudflare Pages** (`@sveltejs/adapter-cloudflare`) at
`https://gastrack.elmoldasoft.us`.

## 1. Cloudflare Pages project

1. Create a Pages project connected to this repo (build command `npm run build`,
   output directory `.svelte-kit/cloudflare` — or let Wrangler/`wrangler.toml` guide it).
2. Set environment variables from `.env.production` (at least):
   - `DATABASE_URL` (Neon pooled)
   - `BETTER_AUTH_SECRET`
   - `BETTER_AUTH_URL=https://gastrack.elmoldasoft.us`
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
   - R2 keys when photo upload ships

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
