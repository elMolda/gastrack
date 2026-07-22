import { redirect, type Handle } from '@sveltejs/kit';
import { getSessionUser, userHasCars, type AppUser } from '$lib/auth';

const publicRoutes = [
	'/auth/login',
	'/auth/register',
	'/auth/car-setup',
	'/privacy',
	'/api/auth'
];

const alwaysAccessible = ['/auth/car-setup', '/privacy', '/api/auth'];

export const handle: Handle = async ({ event, resolve }) => {
	let user: AppUser | null = null;
	try {
		user = await getSessionUser(event);
	} catch (err) {
		// Surface misconfig (missing env / unmigrated DB) in Workers logs instead of opaque 500s.
		console.error('[hooks] getSessionUser failed', err);
		throw err;
	}
	event.locals.user = user;
	// Keep `session` as a thin compatibility shape for loaders not yet ported.
	event.locals.session = user ? { user: { id: user.id, email: user.email } } : null;

	const path = event.url.pathname;
	const isPublicRoute = publicRoutes.some((route) => path.startsWith(route));
	const isAlwaysAccessible = alwaysAccessible.some((route) => path.startsWith(route));

	if (!user && !isPublicRoute) {
		throw redirect(303, '/auth/login');
	}

	if (user && isPublicRoute && !isAlwaysAccessible) {
		throw redirect(303, '/');
	}

	if (user && !isPublicRoute && path !== '/auth/car-setup') {
		const hasCars = await userHasCars(user.id);
		if (!hasCars) {
			throw redirect(303, '/auth/car-setup');
		}
	}

	return resolve(event);
};
