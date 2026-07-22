import { fail, redirect } from '@sveltejs/kit';
import { createCar } from '$lib/db/queries/cars';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/auth/login');
	}
	// Multi-car add is paused until car-scoped logs + dashboard filter ship (see GitHub issue).
	throw redirect(303, '/cars');
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
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
			await createCar(user.id, {
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
