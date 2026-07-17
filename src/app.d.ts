// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { Session } from '@supabase/supabase-js';
import type { FuelLog, DashboardStats } from '$lib/types';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			session: Session | null;
		}
		interface PageData {
			logs: FuelLog[];
			stats: DashboardStats;
			cars: any[];
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
