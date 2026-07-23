import { fail, redirect } from '@sveltejs/kit';
import { requireUser } from '$lib/auth';
import { createCar } from '$lib/db/queries/cars';
import { parseOptionalColombianLicensePlate } from '$lib/validation/licensePlate';
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
		const plate = parseOptionalColombianLicensePlate(String(form.get('licensePlate') ?? ''));

		if (!brand || !model || !Number.isFinite(year)) {
			return fail(400, { error: 'invalid' });
		}
		if (!plate.ok) {
			return fail(400, { error: 'invalid_license_plate' });
		}

		await createCar(user.id, {
			brand,
			model,
			year,
			licensePlate: plate.value,
			isDefault: true
		});

		throw redirect(303, '/');
	}
};
