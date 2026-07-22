import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Prefer Compose-injected DATABASE_URL. Fall back to profile files for rare host use.
config({ path: '.env.local' });
config({ path: '.env' });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
	throw new Error(
		'DATABASE_URL is required for drizzle-kit.\n' +
			'  Local (Docker): docker compose up --build\n' +
			'  Or set DATABASE_URL in .env.local'
	);
}

export default defineConfig({
	schema: './src/lib/db/schema.ts',
	out: './drizzle',
	dialect: 'postgresql',
	dbCredentials: {
		url: databaseUrl
	},
	strict: true,
	verbose: true
});
