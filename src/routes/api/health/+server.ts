import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPrivateEnv } from '$lib/server/env';

const REQUIRED = [
	'DATABASE_URL',
	'BETTER_AUTH_SECRET',
	'BETTER_AUTH_URL',
	'GOOGLE_CLIENT_ID',
	'GOOGLE_CLIENT_SECRET'
] as const;

/** Deploy smoke check — reports which secrets are present (not their values). */
export const GET: RequestHandler = async ({ platform }) => {
	const present: Record<string, boolean> = {};
	for (const key of REQUIRED) {
		const fromHelper = Boolean(getPrivateEnv(key));
		const fromPlatform = Boolean(platform?.env?.[key]);
		present[key] = fromHelper || fromPlatform;
	}

	const ok = REQUIRED.every((key) => present[key]);
	return json(
		{
			ok,
			present,
			compat: {
				hasPlatform: Boolean(platform),
				pages: platform?.env?.CF_PAGES ?? null
			}
		},
		{ status: ok ? 200 : 503 }
	);
};
