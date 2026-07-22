import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '$lib/db';
import { fuelLogs } from '$lib/db/schema';
import type { DistanceUnit, DriveType, EfficiencyUnit, FuelLog, FuelUnit } from '$lib/types';

export type CreateFuelLogInput = {
	carId: string;
	date: string;
	distance: number;
	distUnit: DistanceUnit;
	fuel: number;
	fuelUnit: FuelUnit;
	price: number;
	driveType: DriveType;
	carReported?: number | null;
	carReportedUnit?: EfficiencyUnit | null;
};

export type UpdateFuelLogInput = Partial<CreateFuelLogInput>;

function mapFuelLog(row: typeof fuelLogs.$inferSelect): FuelLog {
	return {
		id: row.id,
		date: row.date,
		distance: Number(row.distance),
		distUnit: row.distUnit as DistanceUnit,
		fuel: Number(row.fuel),
		fuelUnit: row.fuelUnit as FuelUnit,
		price: Number(row.price),
		driveType: row.driveType as DriveType,
		carReported: row.carReported != null ? Number(row.carReported) : null,
		carReportedUnit: (row.carReportedUnit as EfficiencyUnit | null) ?? null,
		carId: row.carId
	};
}

/** All fuel logs for a user, newest first. */
export async function getUserFuelLogs(userId: string, limit?: number): Promise<FuelLog[]> {
	const query = db
		.select()
		.from(fuelLogs)
		.where(eq(fuelLogs.userId, userId))
		.orderBy(desc(fuelLogs.date));

	const rows = limit != null ? await query.limit(limit) : await query;
	return rows.map(mapFuelLog);
}

/** Fuel logs for a car owned by the user. */
export async function getCarFuelLogs(
	userId: string,
	carId: string,
	limit?: number
): Promise<FuelLog[]> {
	const query = db
		.select()
		.from(fuelLogs)
		.where(and(eq(fuelLogs.userId, userId), eq(fuelLogs.carId, carId)))
		.orderBy(desc(fuelLogs.date));

	const rows = limit != null ? await query.limit(limit) : await query;
	return rows.map(mapFuelLog);
}

/** Single fuel log owned by the user, or null. */
export async function getFuelLogById(userId: string, logId: string): Promise<FuelLog | null> {
	const [row] = await db
		.select()
		.from(fuelLogs)
		.where(and(eq(fuelLogs.id, logId), eq(fuelLogs.userId, userId)))
		.limit(1);
	return row ? mapFuelLog(row) : null;
}

/** Create a fuel log for the user. */
export async function createFuelLog(userId: string, input: CreateFuelLogInput): Promise<FuelLog> {
	const [row] = await db
		.insert(fuelLogs)
		.values({
			userId,
			carId: input.carId,
			date: input.date,
			distance: String(input.distance),
			distUnit: input.distUnit,
			fuel: String(input.fuel),
			fuelUnit: input.fuelUnit,
			price: String(input.price),
			driveType: input.driveType,
			carReported: input.carReported != null ? String(input.carReported) : null,
			carReportedUnit: input.carReportedUnit ?? null
		})
		.returning();

	return mapFuelLog(row);
}

/**
 * Update a fuel log owned by the user.
 * Throws if missing or not owned.
 */
export async function updateFuelLog(
	userId: string,
	logId: string,
	updates: UpdateFuelLogInput
): Promise<FuelLog> {
	const existing = await getFuelLogById(userId, logId);
	if (!existing) {
		throw new Error('Fuel log not found');
	}

	const [row] = await db
		.update(fuelLogs)
		.set({
			...(updates.carId !== undefined ? { carId: updates.carId } : {}),
			...(updates.date !== undefined ? { date: updates.date } : {}),
			...(updates.distance !== undefined ? { distance: String(updates.distance) } : {}),
			...(updates.distUnit !== undefined ? { distUnit: updates.distUnit } : {}),
			...(updates.fuel !== undefined ? { fuel: String(updates.fuel) } : {}),
			...(updates.fuelUnit !== undefined ? { fuelUnit: updates.fuelUnit } : {}),
			...(updates.price !== undefined ? { price: String(updates.price) } : {}),
			...(updates.driveType !== undefined ? { driveType: updates.driveType } : {}),
			...(updates.carReported !== undefined
				? { carReported: updates.carReported != null ? String(updates.carReported) : null }
				: {}),
			...(updates.carReportedUnit !== undefined
				? { carReportedUnit: updates.carReportedUnit }
				: {}),
			updatedAt: new Date()
		})
		.where(and(eq(fuelLogs.id, logId), eq(fuelLogs.userId, userId)))
		.returning();

	if (!row) {
		throw new Error('Fuel log not found');
	}

	return mapFuelLog(row);
}

/** Delete a fuel log owned by the user. */
export async function deleteFuelLog(userId: string, logId: string): Promise<void> {
	const existing = await getFuelLogById(userId, logId);
	if (!existing) {
		throw new Error('Fuel log not found');
	}

	await db
		.delete(fuelLogs)
		.where(and(eq(fuelLogs.id, logId), eq(fuelLogs.userId, userId)));
}

/** Paginated recent logs for a user. */
export async function getRecentFuelLogs(
	userId: string,
	page = 1,
	pageSize = 10
): Promise<FuelLog[]> {
	const offset = (page - 1) * pageSize;
	const rows = await db
		.select()
		.from(fuelLogs)
		.where(eq(fuelLogs.userId, userId))
		.orderBy(desc(fuelLogs.date))
		.limit(pageSize)
		.offset(offset);
	return rows.map(mapFuelLog);
}

/** Aggregate stats for a user's fuel logs (`numeric` parsed to number). */
export async function getFuelLogsStats(userId: string): Promise<{
	totalLogs: number;
	totalDistance: number;
	totalFuel: number;
	totalSpent: number;
	avgEfficiency: number;
}> {
	const rows = await db
		.select({
			distance: fuelLogs.distance,
			fuel: fuelLogs.fuel,
			price: fuelLogs.price
		})
		.from(fuelLogs)
		.where(eq(fuelLogs.userId, userId));

	const totalLogs = rows.length;
	const totalDistance = rows.reduce((sum, log) => sum + Number(log.distance), 0);
	const totalFuel = rows.reduce((sum, log) => sum + Number(log.fuel), 0);
	const totalSpent = rows.reduce(
		(sum, log) => sum + Number(log.fuel) * Number(log.price),
		0
	);
	const avgEfficiency = totalFuel > 0 ? totalDistance / totalFuel : 0;

	return { totalLogs, totalDistance, totalFuel, totalSpent, avgEfficiency };
}

/** Quick existence check used by auth hooks. */
export async function userHasFuelLogs(userId: string): Promise<boolean> {
	const [row] = await db
		.select({ n: sql<number>`1` })
		.from(fuelLogs)
		.where(eq(fuelLogs.userId, userId))
		.limit(1);
	return Boolean(row);
}
