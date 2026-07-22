import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { eq } from 'drizzle-orm';
import { getRequestEvent } from '$app/server';
import {
	BETTER_AUTH_SECRET,
	BETTER_AUTH_URL,
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET
} from '$env/static/private';
import { db } from '$lib/db';
import * as schema from '$lib/db/schema';
import { users } from '$lib/db/schema';

const AUTH_PROVIDER = 'better-auth';

/** Upsert our owned `users` row from a Better Auth user. */
export async function upsertDomainUser(authUser: {
	id: string;
	email: string;
	name?: string | null;
}) {
	const bySubject = await db
		.select()
		.from(users)
		.where(eq(users.authSubject, authUser.id))
		.limit(1);

	if (bySubject[0]) {
		return bySubject[0];
	}

	const byEmail = await db
		.select()
		.from(users)
		.where(eq(users.email, authUser.email))
		.limit(1);

	if (byEmail[0]) {
		const [updated] = await db
			.update(users)
			.set({
				authProvider: AUTH_PROVIDER,
				authSubject: authUser.id,
				username: byEmail[0].username ?? authUser.name ?? null,
				updatedAt: new Date()
			})
			.where(eq(users.id, byEmail[0].id))
			.returning();
		return updated;
	}

	const [created] = await db
		.insert(users)
		.values({
			email: authUser.email,
			username: authUser.name ?? null,
			authProvider: AUTH_PROVIDER,
			authSubject: authUser.id
		})
		.returning();

	return created;
}

/**
 * Better Auth instance — only imported from the auth facade / API route.
 * Downstream app code must use `$lib/auth`, never this module.
 */
export const auth = betterAuth({
	baseURL: BETTER_AUTH_URL,
	secret: BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema: {
			user: schema.user,
			session: schema.session,
			account: schema.account,
			verification: schema.verification
		}
	}),
	emailAndPassword: {
		enabled: true
	},
	socialProviders: {
		google: {
			clientId: GOOGLE_CLIENT_ID,
			clientSecret: GOOGLE_CLIENT_SECRET
		}
	},
	account: {
		accountLinking: {
			enabled: true,
			trustedProviders: ['google']
		}
	},
	databaseHooks: {
		user: {
			create: {
				after: async (user) => {
					await upsertDomainUser(user);
				}
			}
		}
	},
	plugins: [sveltekitCookies(getRequestEvent)]
});

export type AuthSession = typeof auth.$Infer.Session;
