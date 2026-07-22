import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { resetUserData } from '$lib/db/queries/cars';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/auth/login');
	}

	return {
		email: locals.user.email
	};
};

export const actions: Actions = {
	reset: async ({ locals }) => {
		const user = locals.user;
		if (!user) {
			throw redirect(303, '/auth/login');
		}

		try {
			await resetUserData(user.id);
		} catch {
			return fail(500, { error: 'reset_failed' });
		}

		throw redirect(303, '/auth/car-setup');
	}
};
