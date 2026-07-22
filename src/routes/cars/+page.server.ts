import { redirect } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { db } from '$lib/db';
import { cars } from '$lib/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;
	if (!user) {
		throw redirect(303, '/auth/login');
	}

	const rows = await db
		.select()
		.from(cars)
		.where(eq(cars.userId, user.id))
		.orderBy(desc(cars.createdAt));

	return {
		cars: rows.map((car) => ({
			id: car.id,
			brand: car.brand,
			model: car.model,
			year: car.year,
			license_plate: car.licensePlate,
			picture_url: car.pictureUrl,
			is_default: car.isDefault,
			created_at: car.createdAt.toISOString()
		}))
	};
};
