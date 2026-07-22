import { redirect } from '@sveltejs/kit';
import { calculateDashboardStats } from '$lib/types';
import { getUserCars } from '$lib/db/queries/cars';
import { getUserFuelLogs } from '$lib/db/queries/fuelLogs';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;
	if (!user) {
		throw redirect(303, '/auth/login');
	}

	const [logs, cars] = await Promise.all([
		getUserFuelLogs(user.id),
		getUserCars(user.id)
	]);

	return {
		logs,
		stats: calculateDashboardStats(logs),
		cars
	};
};
