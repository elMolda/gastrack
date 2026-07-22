import { createServerSupabase } from '$lib/db/server';
import { redirect, type Handle } from '@sveltejs/kit';

// Public routes that don't require authentication
const publicRoutes = [
	'/auth/login',
	'/auth/register',
	'/auth/car-setup',
	'/privacy'
];

export const handle: Handle = async ({ event, resolve }) => {
	// Create a server-side Supabase client using the request cookies
	const supabase = createServerSupabase(event);
	
	// Get session from Supabase
	const { data: { session } } = await supabase.auth.getSession();
	event.locals.session = session;

	// Check if user is trying to access a protected route
	const isPublicRoute = publicRoutes.some(route => event.url.pathname.startsWith(route));
	
	if (!session && !isPublicRoute) {
		// Redirect to login if not authenticated and not on public route
		throw redirect(303, '/auth/login');
	}

	// Public routes that authenticated users are still allowed to view directly
	const alwaysAccessible = ['/auth/car-setup', '/privacy'];
	const isAlwaysAccessible = alwaysAccessible.some(route => event.url.pathname.startsWith(route));

	if (session && isPublicRoute && !isAlwaysAccessible) {
		// If user is logged in and tries to access login/register, redirect to dashboard
		throw redirect(303, '/');
	}

	// Special case: if user is logged in but has no cars, redirect to car-setup
	if (session && !isPublicRoute && event.url.pathname !== '/auth/car-setup') {
		const { data: cars } = await supabase
			.from('cars')
			.select('id')
			.eq('user_id', session.user.id)
			.limit(1);

		if (!cars || cars.length === 0) {
			throw redirect(303, '/auth/car-setup');
		}
	}

	return resolve(event);
};