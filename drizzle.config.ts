import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Load .env if present; shell-exported DATABASE_URL still wins when already set.
config({ path: '.env' });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
	throw new Error(
		'DATABASE_URL is required for drizzle-kit.\n' +
			'  Local:  export DATABASE_URL=postgresql://gastrack:gastrack@127.0.0.1:5433/gastrack\n' +
			'  Or set DATABASE_URL=... in .env (KEY=value, not KEY:value).'
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
