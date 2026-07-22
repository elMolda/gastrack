import { fail, redirect } from '@sveltejs/kit';
import { requireUser } from '$lib/auth';
import { createCar } from '$lib/db/queries/cars';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	await requireUser(event);
	return {};
};

export const actions: Actions = {
	default: async (event) => {
		const user = await requireUser(event);
		const form = await event.request.formData();

		const brand = String(form.get('brand') ?? '').trim();
		const model = String(form.get('model') ?? '').trim();
		const year = Number.parseInt(String(form.get('year') ?? ''), 10);
		const licensePlate = String(form.get('licensePlate') ?? '').trim();

		if (!brand || !model || !Number.isFinite(year)) {
			return fail(400, { error: 'invalid' });
		}

		await createCar(user.id, {
			brand,
			model,
			year,
			licensePlate: licensePlate || null,
			isDefault: true
		});

		throw redirect(303, '/');
	}
};
