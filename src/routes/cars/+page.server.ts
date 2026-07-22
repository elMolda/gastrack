import { fail, redirect } from '@sveltejs/kit';
import { getUserCars, deleteCar } from '$lib/db/queries/cars';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;
	if (!user) {
		throw redirect(303, '/auth/login');
	}

	return { cars: await getUserCars(user.id) };
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		const user = locals.user;
		if (!user) {
			throw redirect(303, '/auth/login');
		}

		const form = await request.formData();
		const carId = String(form.get('carId') ?? '');
		if (!carId) {
			return fail(400, { error: 'missing' });
		}

		try {
			await deleteCar(user.id, carId);
		} catch {
			return fail(400, { error: 'delete_failed' });
		}

		const remaining = await getUserCars(user.id);
		if (remaining.length === 0) {
			throw redirect(303, '/auth/car-setup');
		}

		return { ok: true };
	}
};
