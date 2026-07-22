# GasTrack

SvelteKit application for tracking vehicles and fuel consumption.

## Environment files

| File | Used by |
|---|---|
| `.env.local` | Local Docker Compose stack |
| `.env.production` | Cloudflare Pages (paste vars there — not used by Docker) |

```sh
cp .env.local.example .env.local
cp .env.production.example .env.production
# fill secrets into both files
```

## Local development (Docker only)

```sh
docker compose -f docker-compose.local.yml up --build
```

This starts Postgres, applies Drizzle migrations, then the Vite dev server.
Open <http://localhost:5173>. Source is bind-mounted (hot reload).

```sh
# background
docker compose -f docker-compose.local.yml up -d --build
docker compose -f docker-compose.local.yml logs -f app

# stop (keep data)
docker compose -f docker-compose.local.yml down

# stop + wipe local DB
docker compose -f docker-compose.local.yml down -v
```

### Useful one-offs

```sh
docker compose -f docker-compose.local.yml exec app npm run check
docker compose -f docker-compose.local.yml exec app npm run db:generate
docker compose -f docker-compose.local.yml exec app npm run db:migrate
```

Postgres is also on `localhost:5433` (user/password/db: `gastrack`) for inspection.

## Production

Deploy on Cloudflare Pages. Set the keys from `.env.production` in the Pages
project environment. Run migrations against Neon once:

```sh
docker compose -f docker-compose.local.yml run --rm \
  -e DATABASE_URL="$DATABASE_URL" \
  app npm run db:migrate
```

(or point any machine with the repo + Node at the Neon `DATABASE_URL`).

## Legacy Supabase stack

`docker compose up` (default `docker-compose.yml`) is the old Supabase-based
local stack. Prefer `docker-compose.local.yml` on the migration branch.
