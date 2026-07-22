import { redirect, type RequestEvent } from '@sveltejs/kit';
import { users } from '$lib/db/schema';
import { getUserCars } from '$lib/db/queries/cars';
import { auth, upsertDomainUser } from './provider';

export type AppUser = {
	id: string;
	email: string;
	username: string | null;
};

function toAppUser(row: typeof users.$inferSelect): AppUser {
	return {
		id: row.id,
		email: row.email,
		username: row.username
	};
}

/**
 * Verify the Better Auth session and resolve to our owned `users.id`.
 * All server code should use this — never Better Auth APIs directly.
 */
export async function getSessionUser(event: RequestEvent): Promise<AppUser | null> {
	const session = await auth.api.getSession({ headers: event.request.headers });
	if (!session?.user) return null;

	const domainUser = await upsertDomainUser({
		id: session.user.id,
		email: session.user.email,
		name: session.user.name
	});

	return toAppUser(domainUser);
}

export async function requireUser(event: RequestEvent): Promise<AppUser> {
	const user = await getSessionUser(event);
	if (!user) throw redirect(303, '/auth/login');
	return user;
}

export async function userHasCars(userId: string): Promise<boolean> {
	const list = await getUserCars(userId);
	return list.length > 0;
}

/** Re-export only what the API route needs to mount the handler. */
export { auth };
