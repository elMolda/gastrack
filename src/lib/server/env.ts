import { env as dynamicPrivate } from '$env/dynamic/private';
import { getRequestEvent } from '$app/server';

/**
 * Read a private env var on both Docker/local (process/.env) and Cloudflare Pages.
 * Pages encrypted secrets are on `platform.env`; `$env/dynamic/private` alone can miss them.
 */
export function getPrivateEnv(name: string): string | undefined {
	const fromDynamic = dynamicPrivate[name];
	if (typeof fromDynamic === 'string' && fromDynamic.length > 0) {
		return fromDynamic;
	}

	try {
		const platformEnv = getRequestEvent().platform?.env;
		const fromPlatform = platformEnv?.[name];
		if (typeof fromPlatform === 'string' && fromPlatform.length > 0) {
			return fromPlatform;
		}
	} catch {
		// Outside a request (e.g. module init during build) — ignore.
	}

	return undefined;
}

export function requirePrivateEnv(name: string): string {
	const value = getPrivateEnv(name);
	if (!value) {
		throw new Error(`${name} is not set`);
	}
	return value;
}
