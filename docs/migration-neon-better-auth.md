# Migration Plan: Supabase → Neon + Better Auth + Drizzle

Status: **Planned** (implement later on a separate branch)
Owner: ElMolda Software
Last updated: 2026-07-21

---

## 1. Goal & constraints

Move off Supabase to a **portable, vendor-neutral stack** while keeping cost at **$0**, hosting the app on **Cloudflare Pages** at a custom subdomain (e.g. `gastrack.elmoldasoft.us`).

Hard constraints:

- **$0 cost** — free tiers only, no paid AWS services.
- **Cloudflare Pages** hosts the app (`adapter-cloudflare`), served from our own Cloudflare-managed domain.
- **No vendor lock-in** — every layer talks over standard interfaces. Leaving Neon must be a connection-string change; leaving Cloudflare must be an adapter swap.

Non-goals:

- No RDS or multi-service AWS.
- Not using Neon's "Managed Better Auth" (vendor-coupled, and no SvelteKit support yet). We self-host Better Auth instead.

---

## 2. Target stack

| Layer | Current (Supabase) | Target | Portability |
|---|---|---|---|
| Database | Supabase Postgres | **Neon** (plain Postgres) | Standard Postgres URL — swappable for any Postgres |
| Query layer | PostgREST via `supabase-js` | **Drizzle ORM** | Schema + queries in our code |
| Auth | Supabase Auth (GoTrue) | **Better Auth** (self-hosted) | Open-source, tables in our DB |
| Access control | Postgres RLS (`auth.uid()`) | **Query-layer ownership checks** | Enforced in server code |
| Realtime | Supabase Realtime | **Polling** (`invalidate`) | No infra, no vendor |
| Object storage | Supabase Storage (unused) | **Cloudflare R2** (car photos) | S3-compatible — swappable for B2/S3 |
| Host | Vercel | **Cloudflare Pages** (`adapter-cloudflare`) | Standard SvelteKit — adapter swap to move |

> Because the app runs on the **Cloudflare Workers (edge) runtime**, use the **`@neondatabase/serverless`** HTTP driver for Neon (a raw TCP driver won't run on the edge). This is the one host-driven choice; everything else stays portable.

---

## 3. Key architectural shift

Today the **browser** calls the database directly through PostgREST, and **RLS** prevents users from seeing each other's rows.

Drizzle has **no browser API**, so all DB access must move **server-side**:

```
Before:  Browser ──► PostgREST ──► Postgres   (RLS enforces ownership)
After:   Browser ──► SvelteKit server (form action / +server.ts) ──► Drizzle ──► Postgres
                        (explicitly filters by session.user.id)
```

Consequences:

- CRUD moves from browser `supabase.from(...)` calls into **`+page.server.ts` form actions** or **`+server.ts` endpoints**.
- **RLS is replaced by explicit ownership filters.** Every query MUST include `where user_id = session.user.id`. This is the single biggest risk area (see §11).

---

## 4. Current Supabase dependency inventory

Everything that must change, grouped by concern.

### Auth
- `src/lib/db/client.ts` — `supabase.auth` helpers (`getSession`, `getUser`).
- `src/lib/db/server.ts` — `createServerClient` cookie-based session.
- `src/hooks.server.ts` — `supabase.auth.getSession()` guard + car-setup redirect.
- `src/routes/auth/login/+page.svelte` — `supabase.auth.signInWithPassword`.
- `src/routes/auth/register/+page.svelte` — `supabase.auth.signUp` + manual `users` insert.

### Data access (browser client → PostgREST)
- `src/lib/db/queries/cars.ts` — `getUserCars`, `getCarById`, `getDefaultCar`, `createCar`, `updateCar`, `deleteCar`, `resetUserData`.
- `src/lib/db/queries/fuelLogs.ts` — full CRUD + stats helpers.
- `src/routes/cars/+page.svelte`, `cars/new/+page.svelte`, `cars/[id]/edit/+page.svelte` — call the query functions client-side.
- `src/routes/auth/car-setup/+page.svelte` — creates first car.
- `src/routes/logs/new/+page.svelte` — creates fuel log.
- `src/routes/settings/+page.svelte` — `resetUserData`.

### Server loaders (already server-side, easier to port)
- `src/routes/+page.server.ts` — dashboard logs + cars.
- `src/routes/cars/+page.server.ts`, `cars/[id]/edit/+page.server.ts`.

### Realtime
- `src/routes/+page.svelte` — `supabase.channel('fuel-logs-changes')` INSERT/DELETE → `window.location.reload()`.

### Schema / types
- `src/lib/db/schema.ts` — hand-written Supabase `Database` type.
- `src/lib/types.ts` — domain types (`FuelLog`, `Car`, `User`) + `calculateDashboardStats` (keep; pure logic).

### Migrations / infra
- `supabase/migrations/*` — `auth.users` FK, `handle_new_user()` trigger, RLS policies, roles (`anon`/`authenticated`/`service_role`), `supabase_realtime` publication.
- `docker-compose.yml`, `docker/supabase/*` — 6-service local Supabase stack.
- `supabase-schema.sql`, `supabase/config.toml`.
- `@supabase/ssr`, `@supabase/supabase-js` in `package.json`.

---

## 5. Target dependencies

Add:

- `drizzle-orm`, `drizzle-kit`
- `@neondatabase/serverless` (HTTP driver — required for the Cloudflare edge runtime)
- `better-auth`
- `@aws-sdk/client-s3` (or `aws4fetch`) — S3-compatible client for Cloudflare R2 uploads
- `@sveltejs/adapter-cloudflare` (replaces `@sveltejs/adapter-vercel`)

Remove:

- `@supabase/ssr`, `@supabase/supabase-js`, `supabase` (CLI)
- `@sveltejs/adapter-vercel`

New env vars:

```
DATABASE_URL=postgres://...neon...
BETTER_AUTH_SECRET=<random 32+ chars>
BETTER_AUTH_URL=http://localhost:5173   # prod: https://gastrack.elmoldasoft.us
# social login — Google only in this version (free on Better Auth, no MAU limits):
GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
# object storage (Cloudflare R2, S3-compatible):
# R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET
# R2_PUBLIC_URL=https://img.elmoldasoft.us
```

> **Social login is free.** Better Auth is an open-source library with no paid tier and no MAU cap; OAuth providers (Google, GitHub, etc.) are built in. This is distinct from Neon's *Managed* Better Auth, which is MAU-priced — we are not using that.

---

## 6. Data model changes

Keep the three domain tables (`users`, `cars`, `fuel_logs`) with the same columns/constraints, but:

- **Drop the `auth.users` FK.** `users.id` becomes a standalone PK owned by us (or we let Better Auth own the identity table — see below).
- **Drop RLS policies, roles, and the realtime publication.**
- **Drop `handle_new_user()` trigger** — user rows are created explicitly at sign-up.
- **Keep** the single-default-vehicle unique index and `ON DELETE CASCADE` FKs between `cars` and `fuel_logs`.

### Identity table decision (portability-first)

Better Auth creates its own tables: `user`, `session`, `account`, `verification`.

Chosen approach: **keep our own `users` table as the domain identity; do NOT FK domain data to Better Auth's `user` table.** This keeps a future auth-provider swap (e.g. Auth0) cheap — see §7a.

```
users(id PK, email, username, auth_provider, auth_subject, created_at, updated_at)
cars.user_id      → users.id
fuel_logs.user_id → users.id
```

- Better Auth's `user`/`session`/`account`/`verification` tables handle **authentication only**.
- On sign-up/first login, upsert a row into our `users` table and map `auth_subject` (Better Auth `user.id`) → `users.id`.
- Domain FKs (`cars`, `fuel_logs`) reference `users.id`, never the auth library's table.
- Swapping providers later = remap `auth_subject`; domain FKs are untouched.
- This replaces the current dual-write (`auth.users` + `public.users`) with a single owned `users` table populated through the auth facade (§7a).

### Drizzle schema sketch (`src/lib/db/schema.ts`)

```ts
import { pgTable, uuid, text, integer, boolean, numeric, date, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

// Better Auth tables (user/session/account/verification) generated via its CLI/adapter.

export const cars = pgTable('cars', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),           // → better-auth user.id
  brand: text('brand').notNull(),
  model: text('model').notNull(),
  year: integer('year').notNull(),
  licensePlate: text('license_plate'),
  pictureUrl: text('picture_url'),
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (t) => ({
  oneDefault: uniqueIndex('cars_one_default_per_user').on(t.userId).where(sql`is_default`)
}));

export const fuelLogs = pgTable('fuel_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  carId: uuid('car_id').notNull().references(() => cars.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  distance: numeric('distance', { precision: 10, scale: 2 }).notNull(),
  distUnit: text('dist_unit').notNull(),        // 'km' | 'mi'
  fuel: numeric('fuel', { precision: 10, scale: 2 }).notNull(),
  fuelUnit: text('fuel_unit').notNull(),        // 'gal' | 'L'
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  driveType: text('drive_type').notNull(),      // 'city' | 'mixed' | 'highway'
  carReported: numeric('car_reported', { precision: 10, scale: 2 }),
  carReportedUnit: text('car_reported_unit'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});
```

> Note: `numeric` comes back as `string` in postgres.js/Drizzle. Parse with `Number()` in the mapping layer (dashboard math in `calculateDashboardStats` expects numbers).

---

## 7. Better Auth wiring (SvelteKit)

**Server instance** (`src/lib/auth.ts`):

```ts
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '$lib/db';

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg' }),
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET }
  },
  user: { additionalFields: { username: { type: 'string', required: false } } }
});
```

Login/register pages add a "Continue with Google" button calling `authClient.signIn.social({ provider: 'google' })`. The redirect/callback URL (`.../api/auth/callback/google`) must be registered in the Google console for both `http://localhost:5173` and `https://gastrack.elmoldasoft.us`.

> **Google setup:** create a Google Cloud project → configure the OAuth consent screen (needs a hosted **privacy-policy URL**) → create OAuth credentials. Basic email/profile scopes need **no app review**; users may see an "unverified app" screen until the app is verified (only required past ~100 users). Chosen as the single social provider for its low setup friction + universal audience. (Facebook was dropped — it needs App Review + a data-deletion callback.)

**Mount the handler** — `src/routes/api/auth/[...all]/+server.ts`:

```ts
import { auth } from '$lib/auth';
export const GET  = ({ request }) => auth.handler(request);
export const POST = ({ request }) => auth.handler(request);
```

**Hook** (`src/hooks.server.ts`) — replace Supabase session lookup:

```ts
const session = await auth.api.getSession({ headers: event.request.headers });
event.locals.session = session;
// keep existing guard + car-setup redirect logic, but query cars via Drizzle
```

**Client** (`src/lib/auth-client.ts`):

```ts
import { createAuthClient } from 'better-auth/svelte';
export const authClient = createAuthClient();
```

Login/register pages call the **auth facade** (§7a), not Better Auth directly. On sign-up, the facade also upserts our owned `users` row (§6) and links `auth_subject` → `users.id`, replacing the manual `public.users` insert in `register/+page.svelte`.

### 7a. Auth facade — the only file that knows the provider

To keep a future move to **Auth0** (or any provider) a one-module change, the app never imports Better Auth outside this facade.

`src/lib/auth/index.ts`:

```ts
import { auth } from './provider';        // Better Auth today; Auth0 later
import { db } from '$lib/db';
import { users } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export type AppUser = { id: string; email: string; username: string | null };

// Verify session, resolve to OUR users.id (not the provider's id).
export async function getSessionUser(event): Promise<AppUser | null> {
  const session = await auth.api.getSession({ headers: event.request.headers });
  if (!session) return null;
  const row = await db.select().from(users)
    .where(eq(users.authSubject, session.user.id)).limit(1);
  return row[0] ?? null;
}

export async function requireUser(event): Promise<AppUser> {
  const user = await getSessionUser(event);
  if (!user) throw redirect(303, '/auth/login');
  return user;
}
```

Rules that make Auth0 cheap later:

- **Everything downstream** (`hooks.server.ts`, loaders, actions) uses `getSessionUser` / `requireUser` and reads the normalized `AppUser` shape from `event.locals` — never Better Auth APIs.
- **Domain data keys off `users.id`**, mapped from the provider's subject (§6). Swapping to Auth0 = reimplement `./provider` + remap `auth_subject`; domain FKs and app code stay put.
- **Model sessions as "verify token → read `sub` → resolve user_id."** Auth0 is OIDC/JWT; Better Auth can also issue JWTs — the same contract fits both.
- Auth0 also has a free tier (~25k MAU incl. social), so this stays $0-compatible.

---

## 8. Query layer rewrite

Rewrite `src/lib/db/queries/cars.ts` and `fuelLogs.ts` as **Drizzle, server-only** functions. Each takes the authenticated `userId` and filters on it.

Example — `getUserCars`:

```ts
import { db } from '$lib/db';
import { cars } from '$lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export function getUserCars(userId: string) {
  return db.select().from(cars).where(eq(cars.userId, userId)).orderBy(desc(cars.createdAt));
}
```

Preserve existing behaviors:

- **Single default:** in `createCar`/`updateCar`, clear other defaults in a transaction before setting the new one (mirrors current logic + keeps the unique index).
- **Cascade delete:** `deleteCar` deletes fuel logs then the car (or rely on FK cascade).
- **`resetUserData`:** delete all fuel logs + cars for the user in a transaction.

Move all mutation call sites to **form actions**:

- `cars/new`, `cars/[id]/edit`, `logs/new`, `auth/car-setup`, `settings` (reset) → add `actions` in their `+page.server.ts` and convert the Svelte forms to `use:enhance`.
- Ownership check on edit/delete: load the row, assert `row.userId === session.user.id` before mutating.

Server loaders (`+page.server.ts` files) switch from the Supabase server client to Drizzle calls — smaller change since they're already server-side.

---

## 9. Realtime → polling

Remove the `supabase.channel(...)` subscription in `src/routes/+page.svelte`.

Replace with lightweight polling using SvelteKit invalidation:

```ts
import { invalidateAll } from '$app/navigation';
import { onMount } from 'svelte';

onMount(() => {
  const id = setInterval(invalidateAll, 15000);           // refresh dashboard data
  const onFocus = () => invalidateAll();
  window.addEventListener('focus', onFocus);
  return () => { clearInterval(id); window.removeEventListener('focus', onFocus); };
});
```

This drops the `window.location.reload()` hack and re-runs the loader instead. Good enough for a single-user fuel tracker. (Upgrade path if needed: SSE endpoint or Pusher/Ably free tier — out of scope.)

---

## 10. Local dev & infra changes

Big simplification: the local stack drops from **6 services to 2**.

- **Remove** `auth`, `rest`, `realtime`, `kong`, and `migrations` (Supabase CLI) services + `docker/supabase/*`.
- **Keep** a plain `postgres:16` container + the `app` container.
- **Migrations** run via `drizzle-kit migrate` (a small one-shot step or an app entrypoint), not Supabase CLI.
- Delete `supabase/`, `supabase-schema.sql`, `supabase/config.toml` after porting schema to Drizzle.
- Add `drizzle.config.ts` (schema path, `DATABASE_URL`, migrations out dir).

New `docker-compose.yml` (sketch): `db` (postgres) + `app` (SvelteKit dev), with `DATABASE_URL=postgres://postgres:postgres@db:5432/gastrack`.

Update `README.md`: local dev = `docker compose up`; migrations = `npm run db:generate` / `db:migrate`.

---

## 11. Risks & mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| **Missing ownership filter** (no RLS safety net) | Data leak between users | Centralize access in query fns that require `userId`; add a review checklist; consider a `withUser(userId)` wrapper; optional: keep lightweight RLS in Postgres as defense-in-depth |
| `numeric` returns strings | Broken dashboard math | Map/parse to `number` at the query boundary |
| Session cookie config on the edge | Broken auth in prod | Set `BETTER_AUTH_URL` to `https://gastrack.elmoldasoft.us`; verify secure cookies over HTTPS |
| Edge runtime incompatibility | Build/runtime failures on Cloudflare | Use `@neondatabase/serverless` (HTTP) + confirm Better Auth runs on Workers; avoid Node-only APIs |
| Neon free-tier limits / cold starts | Latency, caps | Confirm current storage + compute limits before cutover (see open question) |
| Realtime UX regression | No instant updates | Accept polling; document it |

Rollback: the migration lives on a **separate branch**; `main` stays on Supabase (Vercel) until cutover is verified. Fresh-start data (§12) means there is nothing to lose if we abandon the branch.

---

## 12. Data migration — N/A (fresh start)

**Decision: start with fresh data.** There is no existing production data to preserve, so:

- No `pg_dump` / import step.
- No password-hash migration concerns.
- The old Supabase project can be deleted after cutover.
- Neon starts empty; Drizzle migrations create the schema; users simply sign up again.

---

## 13. Implementation phases (branch: `feat/neon-better-auth`)

1. **Scaffolding** — add deps, `drizzle.config.ts`, `src/lib/db/index.ts` (Drizzle client), Drizzle schema incl. owned `users` table (§6); generate first migration; stand up local `db` container.
2. **Auth** — Better Auth provider (`src/lib/auth/provider.ts`) with **Google** social login + **facade** (`src/lib/auth/index.ts`, §7a), auth API route, `auth-client.ts`, rewrite `hooks.server.ts` to use `getSessionUser`/`requireUser`, rewrite login/register pages (email/password + "Continue with Google"; upsert owned `users` row on first sign-in). Register the OAuth redirect URL in the Google console; add a privacy-policy page.
3. **Queries** — port `cars.ts` + `fuelLogs.ts` to Drizzle (server-only); add ownership checks.
4. **Mutations** — convert `cars/new`, `cars/[id]/edit`, `logs/new`, `car-setup`, `settings` to form actions.
5. **Loaders** — port `+page.server.ts` files to Drizzle.
6. **Realtime** — replace subscription with polling.
7. **Infra cleanup** — slim `docker-compose.yml`, remove `supabase/` + Supabase deps, swap `adapter-vercel` → `adapter-cloudflare`, update `README.md`, add `db:generate`/`db:migrate` scripts.
8. **Deploy** — create Neon project; create Cloudflare Pages project (connect repo); set env vars (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, R2 keys); run migrations against Neon; add custom domain `gastrack.elmoldasoft.us`; deploy preview; verify.
9. **Object storage (optional in first cut)** — create R2 bucket + public custom domain; wire car-photo upload (§17).

---

## 14. Acceptance criteria

- [ ] Sign up, log in, log out work end-to-end on Cloudflare Pages + Neon.
- [ ] **Google** login works and creates/links the owned `users` row.
- [ ] Same account resolves consistently across email + Google (linked by email).
- [ ] App is served at `https://gastrack.elmoldasoft.us` with valid TLS.
- [ ] New user with no cars is routed to `/auth/car-setup`.
- [ ] Cars CRUD + single-default enforcement works.
- [ ] Fuel log create (incl. decimal distance like `248.5`) and delete work.
- [ ] Deleting a car cascades to its fuel logs.
- [ ] Settings "reset all data" clears cars + logs, keeps the account.
- [ ] Dashboard stats correct; data refreshes via polling.
- [ ] A user cannot read/mutate another user's rows (ownership checks verified).
- [ ] Car photo uploads to R2 and renders from the public URL (if §17 shipped).
- [ ] `npm run check` and `npm run build` pass (Cloudflare adapter build).
- [ ] No `@supabase/*` imports remain; local stack is `db` + `app` only.
- [ ] Total run cost = $0 within Neon + Cloudflare free tiers.

---

## 15. Decisions & open questions

Decided:

- **Fresh-start data** — no migration (§12).
- **Owned `users` table + auth facade** — for Auth0 portability (§6, §7a).
- **Social login is free** on self-hosted Better Auth — no MAU cost (§5).
- **Ship Google OAuth in this version** (alongside email/password); Facebook dropped for setup overhead (§7).
- **Host on Cloudflare Pages** at `gastrack.elmoldasoft.us` with `adapter-cloudflare` + Neon HTTP driver (§16).
- **Car photos on Cloudflare R2** (S3-compatible, zero egress) (§17).
- **Vision-OCR photo-to-log** captured as a future feature (§18).

Open:

- Confirm **Neon free-tier** current limits (storage, compute hours, autosuspend) for our usage.
- Keep optional Postgres RLS as defense-in-depth, or rely solely on query-layer checks?
- Ship car-photo upload (R2) in the first cutover, or as a fast-follow?

### Account-linking note (email + Google)

A user may sign in with email/password or Google using the **same email**. Better Auth can **link accounts by verified email** so both resolve to one `users` row. Keep this on so `getSessionUser` always maps to a single owned identity (§6/§7a).

---

## 16. Hosting: Cloudflare Pages

App moves from Vercel to **Cloudflare Pages**, served from our Cloudflare-managed domain.

- **Adapter:** swap `@sveltejs/adapter-vercel` → `@sveltejs/adapter-cloudflare` in `svelte.config.js`.
- **Runtime:** Cloudflare **Workers (edge)**, not Node. Consequences:
  - Use the **`@neondatabase/serverless`** HTTP driver for Neon (TCP drivers don't run on the edge).
  - Confirm Better Auth + Drizzle paths avoid Node-only APIs.
- **Custom domain:** in the Pages project → Custom domains → add `gastrack.elmoldasoft.us`. Since the zone is already in Cloudflare, DNS + TLS are auto-provisioned.
- **Free tier:** unlimited custom domains, unlimited requests/bandwidth, ~500 builds/month.
- **Deploy:** connect the GitHub repo; Pages builds on push. Set env vars in the Pages dashboard.

Portability note: leaving Cloudflare later = swap the adapter (`adapter-node`/`adapter-netlify`/etc.) + move DNS. No app-code rewrite.

---

## 17. Object storage (car photos): Cloudflare R2

The `cars.picture_url` column already exists; R2 stores the file it points to.

- **Why R2:** S3-compatible, **zero egress fees**, 10 GB free — and it's in our Cloudflare ecosystem. Swappable for Backblaze B2 / S3 since it's S3-compatible.
- **Bucket:** create an R2 bucket; expose read via a public custom domain (e.g. `img.elmoldasoft.us`).
- **Upload flow:**
  1. User selects a photo in `cars/new` or `cars/[id]/edit`.
  2. A **server action** uploads to R2 (S3 client), or hands the browser a short-lived **presigned URL** for direct upload.
  3. Store the resulting public URL in `cars.picture_url`.
  4. Render with `<img src={car.picture_url}>`.
- **Validate** content-type + size server-side; namespace keys by user (`{userId}/{carId}/{uuid}.jpg`).

Alternative if we want automatic thumbnails/compression without writing resize code: **Cloudinary** free tier (image-first). R2 = raw storage; we handle sizing (or add Cloudflare Images later).

---

## 18. Future feature: photo-to-log (vision OCR)

Let the user snap the pump/receipt; auto-extract **total spent** and **gallons**, then compute the third value. Captured now, not in the initial cutover.

**Pipeline**

1. **Camera:** `<input type="file" accept="image/*" capture="environment">`.
2. **Extract:** send the image to a **vision LLM** → returns `{ total, gallons }` as JSON.
3. **Compute:** derive `pricePerGallon` (schema stores `fuel` + per-unit `price`).
4. **Confirm:** prefill the `logs/new` form; user verifies/edits before saving (never trust extraction blindly).
5. (Optional) store the photo in R2.

**Free extraction options**

- **Cloudflare Workers AI** — free daily allocation, vision models, fits our stack.
- **Google Gemini Flash** — generous free tier, strong at this extraction.
- (Traditional **Tesseract.js** is $0/on-device but weak on glary LED pump displays — vision LLMs are far better here.)

**Notes:** free tiers have rate limits; vision APIs send the image to a third party (fine for personal use); receipts read more reliably than pump screens.
