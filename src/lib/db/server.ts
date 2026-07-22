import { createServerClient } from '@supabase/ssr';
import { env } from '$env/dynamic/private';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { RequestEvent } from '@sveltejs/kit';
import type { Database } from './supabase-types';

function serverFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
	if (!env.PRIVATE_SUPABASE_URL) {
		return fetch(input, init);
	}

	const publicUrl = new URL(PUBLIC_SUPABASE_URL);
	const internalUrl = new URL(env.PRIVATE_SUPABASE_URL);
	const sourceUrl = new URL(
		typeof input === 'string' || input instanceof URL ? input.toString() : input.url
	);

	if (sourceUrl.origin !== publicUrl.origin) {
		return fetch(input, init);
	}

	sourceUrl.protocol = internalUrl.protocol;
	sourceUrl.host = internalUrl.host;

	if (input instanceof Request) {
		return fetch(new Request(sourceUrl, input), init);
	}

	return fetch(sourceUrl, init);
}

export function createServerSupabase(event: RequestEvent) {
	return createServerClient<Database>(
		PUBLIC_SUPABASE_URL,
		PUBLIC_SUPABASE_ANON_KEY,
		{
			global: { fetch: serverFetch },
			cookies: {
				get: (key) => event.cookies.get(key),
				set: (key, value, options) => {
					event.cookies.set(key, value, { ...options, path: '/' });
				},
				remove: (key, options) => {
					event.cookies.delete(key, { ...options, path: '/' });
				}
			}
		}
	);
}

export function createServerSupabaseFromCookies(cookies: {
	get: (key: string) => string | undefined;
}) {
	return createServerClient<Database>(
		PUBLIC_SUPABASE_URL,
		PUBLIC_SUPABASE_ANON_KEY,
		{
			global: { fetch: serverFetch },
			cookies: {
				get: (key) => cookies.get(key),
				set: () => {},
				remove: () => {}
			}
		}
	);
}
