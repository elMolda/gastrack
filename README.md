# GasTrack

SvelteKit application for tracking vehicles and fuel consumption.

## Local development

Local development runs entirely in Docker. It includes the app, PostgreSQL,
Supabase Auth, PostgREST, Realtime, and Kong. Do not run `npm run dev` on the
host: the Compose stack deliberately points the app at its own local Supabase
services instead of the production project.

Requirements:

- Docker Desktop with Docker Compose
- Ports `5173`, `8000`, and `54322` available on localhost

Start the stack:

```sh
docker compose up --build
```

Open the app at <http://localhost:5173>. Source files are bind-mounted, so
SvelteKit reloads when they change.

Run it in the background:

```sh
docker compose up -d --build
docker compose logs -f app
```

Stop the stack while retaining local data:

```sh
docker compose down
```

## Database migrations

SQL migrations live in `supabase/migrations`. On every Compose startup, the
one-shot `migrations` service applies all pending migrations before the API and
app start.

Add a migration using a UTC timestamp:

```text
supabase/migrations/YYYYMMDDHHMMSS_description.sql
```

Apply it by rebuilding and starting the stack:

```sh
docker compose up --build
```

The migration runner connects only to the Compose database hostname (`db`) and
uses deterministic local credentials. It cannot target the production
Supabase project.

## Reset local data

This permanently removes only the Docker-managed local database and then
recreates it from all migrations:

```sh
docker compose down -v
docker compose up --build
```

The local database is also exposed at `localhost:54322` for inspection. Its
development-only credentials are in `docker-compose.yml`; they must never be
reused in a deployed environment.

## Project checks

Run checks inside the app container:

```sh
docker compose exec app npm run check
docker compose exec app npm run build
```
