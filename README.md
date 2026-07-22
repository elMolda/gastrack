# GasTrack

SvelteKit application for tracking vehicles and fuel consumption.

**Stack:** SvelteKit + Drizzle + Better Auth + Neon (prod) / Postgres (local), hosted on Cloudflare Pages.

## Environment files

| File | Used by |
|---|---|
| `.env.local` | Local Docker Compose (`docker compose up`) |
| `.env.production` | Cloudflare Pages env vars (not used by Docker) |

```sh
cp .env.local.example .env.local
cp .env.production.example .env.production
# fill secrets into both files
```

## Local development (Docker)

```sh
docker compose up --build
```

Starts **db** (Postgres) + **app** (applies Drizzle migrations, then Vite).
Open <http://localhost:5173>. Source is bind-mounted (hot reload).

```sh
docker compose up -d --build
docker compose logs -f app

docker compose down          # stop, keep data
docker compose down -v       # stop + wipe local DB
```

### Useful one-offs

```sh
docker compose exec app npm run check
docker compose exec app npm run db:generate
docker compose exec app npm run db:migrate
docker compose exec app npm run build
```

Postgres is also on `localhost:5433` (user/password/db: `gastrack`).

## Database migrations

```sh
docker compose exec app npm run db:generate   # after schema changes
docker compose exec app npm run db:migrate    # apply pending migrations
```

Migrations live in `drizzle/`. Local `docker compose up` runs migrate automatically on app start.

## Production (Cloudflare Pages)

1. Build with `@sveltejs/adapter-cloudflare` (`npm run build`).
2. Set keys from `.env.production` in the Pages project environment.
3. Run migrations against Neon once (any machine with the repo + `DATABASE_URL`):

```sh
DATABASE_URL='postgresql://…neon…' npm run db:migrate
```

Custom domain: `gastrack.elmoldasoft.us` (wired in Migration 8 / issue #9).
