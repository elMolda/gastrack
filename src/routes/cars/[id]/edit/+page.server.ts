import { redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { db } from '$lib/db';
import { cars } from '$lib/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const user = locals.user;
	if (!user) {
		throw redirect(303, '/auth/login');
	}

	const [car] = await db
		.select()
		.from(cars)
		.where(and(eq(cars.id, params.id), eq(cars.userId, user.id)))
		.limit(1);

	if (!car) {
		throw redirect(303, '/cars');
	}

	return {
		car: {
			id: car.id,
			brand: car.brand,
			model: car.model,
			year: car.year,
			license_plate: car.licensePlate,
			picture_url: car.pictureUrl,
			is_default: car.isDefault,
			created_at: car.createdAt.toISOString()
		}
	};
};
