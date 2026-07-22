import { redirect } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { calculateDashboardStats, type FuelLog } from '$lib/types';
import { db } from '$lib/db';
import { cars, fuelLogs } from '$lib/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;
	if (!user) {
		throw redirect(303, '/auth/login');
	}

	const [logRows, carRows] = await Promise.all([
		db
			.select()
			.from(fuelLogs)
			.where(eq(fuelLogs.userId, user.id))
			.orderBy(desc(fuelLogs.date)),
		db.select().from(cars).where(eq(cars.userId, user.id)).orderBy(desc(cars.createdAt))
	]);

	const transformedLogs: FuelLog[] = logRows.map((log) => ({
		id: log.id,
		date: log.date,
		distance: Number(log.distance),
		distUnit: log.distUnit as FuelLog['distUnit'],
		fuel: Number(log.fuel),
		fuelUnit: log.fuelUnit as FuelLog['fuelUnit'],
		price: Number(log.price),
		driveType: log.driveType as FuelLog['driveType'],
		carReported: log.carReported != null ? Number(log.carReported) : null,
		carReportedUnit: (log.carReportedUnit as FuelLog['carReportedUnit']) ?? null,
		carId: log.carId
	}));

	return {
		logs: transformedLogs,
		stats: calculateDashboardStats(transformedLogs),
		cars: carRows.map((car) => ({
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
