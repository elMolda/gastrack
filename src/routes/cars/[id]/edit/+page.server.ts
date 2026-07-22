import { fail, redirect } from '@sveltejs/kit';
import { getCarById, updateCar } from '$lib/db/queries/cars';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const user = locals.user;
	if (!user) {
		throw redirect(303, '/auth/login');
	}

	const car = await getCarById(user.id, params.id);
	if (!car) {
		throw redirect(303, '/cars');
	}

	return { car };
};

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		const user = locals.user;
		if (!user) {
			throw redirect(303, '/auth/login');
		}

		const form = await request.formData();
		const brand = String(form.get('brand') ?? '').trim();
		const model = String(form.get('model') ?? '').trim();
		const year = Number.parseInt(String(form.get('year') ?? ''), 10);
		const licensePlate = String(form.get('licensePlate') ?? '').trim();
		const isDefault = form.get('isDefault') === 'on' || form.get('isDefault') === 'true';

		if (!brand || !model || !Number.isFinite(year)) {
			return fail(400, { error: 'invalid' });
		}

		try {
			await updateCar(user.id, params.id, {
				brand,
				model,
				year,
				licensePlate: licensePlate || null,
				isDefault
			});
		} catch {
			return fail(400, { error: 'save_failed' });
		}

		throw redirect(303, '/cars');
	}
};
