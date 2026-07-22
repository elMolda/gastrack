import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireUser } from '$lib/auth';
import { db } from '$lib/db';
import { cars } from '$lib/db/schema';

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
		const yearRaw = String(form.get('year') ?? '').trim();
		const licensePlate = String(form.get('licensePlate') ?? '').trim();
		const year = Number.parseInt(yearRaw, 10);

		if (!brand || !model || !Number.isFinite(year)) {
			return fail(400, { error: 'invalid' });
		}

		await db.insert(cars).values({
			userId: user.id,
			brand,
			model,
			year,
			licensePlate: licensePlate || null,
			isDefault: true
		});

		throw redirect(303, '/');
	}
};
