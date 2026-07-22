import { neon } from '@neondatabase/serverless';
import { drizzle as drizzleNeonHttp } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '$env/dynamic/private';
import * as schema from './schema';

/**
 * Drizzle client.
 *
 * - Neon (`*.neon.tech`): HTTP driver — required on Cloudflare Pages (edge).
 * - Local Docker Postgres: TCP via postgres.js (Neon HTTP cannot speak plain Postgres).
 */
function createDb() {
	const url = env.DATABASE_URL;
	if (!url) {
		throw new Error('DATABASE_URL is not set');
	}

	if (url.includes('neon.tech')) {
		return drizzleNeonHttp(neon(url), { schema });
	}

	return drizzlePostgres(postgres(url, { prepare: false }), { schema });
}

export const db = createDb();
export type Database = typeof db;
export * from './schema';
