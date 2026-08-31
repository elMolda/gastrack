import { fail, redirect } from '@sveltejs/kit';
import { deleteFuelLog, getUserFuelLogs } from '$lib/db/queries/fuelLogs';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;
	if (!user) {
		throw redirect(303, '/auth/login');
	}

	const logs = await getUserFuelLogs(user.id);
	return { logs };
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
