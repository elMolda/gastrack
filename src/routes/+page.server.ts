import { fail, redirect } from '@sveltejs/kit';
import { calculateDashboardStats } from '$lib/types';
import { getUserCars } from '$lib/db/queries/cars';
import { deleteFuelLog, getUserFuelLogs } from '$lib/db/queries/fuelLogs';
import type { Actions, PageServerLoad } from './$types';

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

export const actions: Actions = {
	deleteLog: async ({ request, locals }) => {
		const user = locals.user;
		if (!user) {
			throw redirect(303, '/auth/login');
		}

		const form = await request.formData();
		const logId = String(form.get('logId') ?? '');
		if (!logId) {
			return fail(400, { error: 'missing' });
		}

		try {
			await deleteFuelLog(user.id, logId);
		} catch {
			return fail(400, { error: 'delete_failed' });
		}

		return { ok: true };
	}
};
