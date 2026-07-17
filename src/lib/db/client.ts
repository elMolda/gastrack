import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from './schema';
import type { RequestEvent } from '@sveltejs/kit';

// Create a browser-side supabase client
export const supabase = createBrowserClient<Database>(
	PUBLIC_SUPABASE_URL,
	PUBLIC_SUPABASE_ANON_KEY
);

// Create a server-side supabase client (for hooks.server.ts)
export function createServerSupabase(event: RequestEvent) {
	return createServerClient<Database>(
		PUBLIC_SUPABASE_URL,
		PUBLIC_SUPABASE_ANON_KEY,
		{
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

// Create a server-side supabase client using cookies directly (for +page.server.ts)
export function createServerSupabaseFromCookies(cookies: { get: (key: string) => string | undefined }) {
	return createServerClient<Database>(
		PUBLIC_SUPABASE_URL,
		PUBLIC_SUPABASE_ANON_KEY,
		{
			cookies: {
				get: (key) => cookies.get(key),
				set: () => {}, // Read-only in load functions
				remove: () => {}
			}
		}
	);
}

// Helper to get the current user session
export async function getSession() {
	const { data: { session }, error } = await supabase.auth.getSession();
	if (error) throw error;
	return session;
}

// Helper to get the current user
export async function getUser() {
	const { data: { user }, error } = await supabase.auth.getUser();
	if (error) throw error;
	return user;
}