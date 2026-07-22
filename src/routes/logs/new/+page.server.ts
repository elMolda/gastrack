import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getDefaultCar } from '$lib/db/queries/cars';
import { createFuelLog } from '$lib/db/queries/fuelLogs';
import type { DistanceUnit, DriveType, EfficiencyUnit, FuelUnit } from '$lib/types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/auth/login');
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const user = locals.user;
		if (!user) {
			throw redirect(303, '/auth/login');
		}

		const form = await request.formData();
		const date = String(form.get('date') ?? '');
		const distance = Number.parseFloat(String(form.get('distance') ?? ''));
		const distUnit = String(form.get('distUnit') ?? 'km') as DistanceUnit;
		const fuel = Number.parseFloat(String(form.get('fuel') ?? ''));
		const fuelUnit = String(form.get('fuelUnit') ?? 'gal') as FuelUnit;
		const price = Number.parseFloat(String(form.get('price') ?? ''));
		const driveType = String(form.get('driveType') ?? 'mixed') as DriveType;
		const carReportedRaw = String(form.get('carReported') ?? '').trim();
		const carReportedUnit = String(form.get('carReportedUnit') ?? 'km/L') as EfficiencyUnit;

		if (!date || !Number.isFinite(distance) || !Number.isFinite(fuel) || !Number.isFinite(price)) {
			return fail(400, { error: 'invalid' });
		}

		const defaultCar = await getDefaultCar(user.id);
		if (!defaultCar) {
			return fail(400, { error: 'no_car' });
		}

		try {
			await createFuelLog(user.id, {
				carId: defaultCar.id,
				date,
				distance,
				distUnit,
				fuel,
				fuelUnit,
				price,
				driveType,
				carReported: carReportedRaw ? Number.parseFloat(carReportedRaw) : null,
				carReportedUnit: carReportedRaw ? carReportedUnit : null
			});
		} catch {
			return fail(500, { error: 'save_failed' });
		}

		throw redirect(303, '/');
	}
};
