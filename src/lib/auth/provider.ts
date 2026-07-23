import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { eq } from 'drizzle-orm';
import { getRequestEvent } from '$app/server';
import { requirePrivateEnv } from '$lib/server/env';
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

function createAuth() {
	const primaryUrl = requirePrivateEnv('BETTER_AUTH_URL');

	return betterAuth({
		// Multi-host: custom domain + Pages preview/production *.pages.dev
		baseURL: {
			allowedHosts: [
				'gastrack.elmoldasoft.us',
				'gastrack-brc.pages.dev',
				'*.gastrack-brc.pages.dev',
				'localhost:*'
			],
			fallback: primaryUrl
		},
		secret: requirePrivateEnv('BETTER_AUTH_SECRET'),
		trustedOrigins: [
			'https://gastrack.elmoldasoft.us',
			'https://gastrack-brc.pages.dev',
			'https://*.gastrack-brc.pages.dev',
			'http://localhost:5173',
			'http://localhost:8788'
		],
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
			enabled: true,
			minPasswordLength: 8,
			maxPasswordLength: 128
		},
		socialProviders: {
			google: {
				clientId: requirePrivateEnv('GOOGLE_CLIENT_ID'),
				clientSecret: requirePrivateEnv('GOOGLE_CLIENT_SECRET')
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
 * Lazy + `requirePrivateEnv` so Cloudflare Pages runtime secrets on
 * `platform.env` work (static `$env` exports fail at build).
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
