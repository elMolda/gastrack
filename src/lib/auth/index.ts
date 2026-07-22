import { redirect, type RequestEvent } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/db';
import { cars, users } from '$lib/db/schema';
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
	const rows = await db
		.select({ id: cars.id })
		.from(cars)
		.where(eq(cars.userId, userId))
		.limit(1);
	return rows.length > 0;
}

/** Re-export only what the API route needs to mount the handler. */
export { auth };
