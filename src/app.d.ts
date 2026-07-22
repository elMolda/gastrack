import type { AppUser } from '$lib/auth';
import type { FuelLog, DashboardStats } from '$lib/types';

declare global {
	namespace App {
		interface Locals {
			/** Owned domain user (our `users` table). Prefer this over `session`. */
			user: AppUser | null;
			/** Thin compatibility shape — `session.user.id` is our `users.id`. */
			session: { user: { id: string; email: string } } | null;
		}
		interface PageData {
			logs?: FuelLog[];
			stats?: DashboardStats;
			cars?: any[];
		}
	}
}

export {};
