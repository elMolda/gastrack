import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { eq } from 'drizzle-orm';
import { getRequestEvent } from '$app/server';
import { env } from '$env/dynamic/private';
import { db } from '$lib/db';
import * as schema from '$lib/db/schema';
import { users } from '$lib/db/schema';

const AUTH_PROVIDER = 'better-auth';

function requireEnv(name: keyof typeof env): string {
	const value = env[name];
	if (!value) {
		throw new Error(`${String(name)} is not set`);
	}
	return value;
}

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

function createAuth() {
	return betterAuth({
		baseURL: requireEnv('BETTER_AUTH_URL'),
		secret: requireEnv('BETTER_AUTH_SECRET'),
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
				clientId: requireEnv('GOOGLE_CLIENT_ID'),
				clientSecret: requireEnv('GOOGLE_CLIENT_SECRET')
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
}

type Auth = ReturnType<typeof createAuth>;

/**
 * Better Auth instance — only imported from the auth facade / API route.
 * Downstream app code must use `$lib/auth`, never this module.
 *
 * Lazy: `$env/static/private` fails Cloudflare Pages builds when secrets
 * are runtime-only; dynamic + lazy reads them from platform.env at request time.
 */
let _auth: Auth | undefined;

export const auth: Auth = new Proxy({} as Auth, {
	get(_target, prop, receiver) {
		if (!_auth) _auth = createAuth();
		const value = Reflect.get(_auth, prop, receiver);
		return typeof value === 'function' ? value.bind(_auth) : value;
	}
});

export type AuthSession = Auth['$Infer']['Session'];
