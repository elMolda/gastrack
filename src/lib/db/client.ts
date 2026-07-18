import { createBrowserClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from './schema';

// Create a browser-side supabase client
export const supabase = createBrowserClient<Database>(
	PUBLIC_SUPABASE_URL,
	PUBLIC_SUPABASE_ANON_KEY
);

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