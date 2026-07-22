import { neon } from '@neondatabase/serverless';
import { drizzle as drizzleNeonHttp } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { requirePrivateEnv } from '$lib/server/env';
import * as schema from './schema';

/**
 * Drizzle client.
 *
 * - Neon (`*.neon.tech`): HTTP driver — required on Cloudflare Pages (edge).
 * - Local Docker Postgres: TCP via postgres.js (Neon HTTP cannot speak plain Postgres).
 *
 * Lazy so `vite build` succeeds without DATABASE_URL; value is read at request
 * time from `$env/dynamic/private` or Cloudflare `platform.env`.
 */
function createDb() {
	const url = requirePrivateEnv('DATABASE_URL');

	if (url.includes('neon.tech')) {
		return drizzleNeonHttp(neon(url), { schema });
	}

	return drizzlePostgres(postgres(url, { prepare: false }), { schema });
}

type Database = ReturnType<typeof createDb>;

let _db: Database | undefined;

export const db: Database = new Proxy({} as Database, {
	get(_target, prop, receiver) {
		if (!_db) _db = createDb();
		const value = Reflect.get(_db as object, prop, receiver);
		return typeof value === 'function' ? value.bind(_db) : value;
	}
});

export type { Database };
export * from './schema';
