import { and, desc, eq, ne } from 'drizzle-orm';
import { db } from '$lib/db';
import { cars, fuelLogs } from '$lib/db/schema';
import type { Car } from '$lib/types';

export type CreateCarInput = {
	brand: string;
	model: string;
	year: number;
	licensePlate?: string | null;
	pictureUrl?: string | null;
	isDefault?: boolean;
};

export type UpdateCarInput = {
	brand?: string;
	model?: string;
	year?: number;
	licensePlate?: string | null;
	pictureUrl?: string | null;
	isDefault?: boolean;
};

function mapCar(row: typeof cars.$inferSelect): Car {
	return {
		id: row.id,
		brand: row.brand,
		model: row.model,
		year: row.year,
		licensePlate: row.licensePlate ?? undefined,
		pictureUrl: row.pictureUrl ?? undefined,
		createdAt: row.createdAt.toISOString(),
		isDefault: row.isDefault
	};
}

/** All cars for a user, newest first. */
export async function getUserCars(userId: string): Promise<Car[]> {
	const rows = await db
		.select()
		.from(cars)
		.where(eq(cars.userId, userId))
		.orderBy(desc(cars.createdAt));
	return rows.map(mapCar);
}

/** Single car owned by the user, or null. */
export async function getCarById(userId: string, carId: string): Promise<Car | null> {
	const [row] = await db
		.select()
		.from(cars)
		.where(and(eq(cars.id, carId), eq(cars.userId, userId)))
		.limit(1);
	return row ? mapCar(row) : null;
}

/** Default car, or first car if none marked default. */
export async function getDefaultCar(userId: string): Promise<Car | null> {
	const [defaultRow] = await db
		.select()
		.from(cars)
		.where(and(eq(cars.userId, userId), eq(cars.isDefault, true)))
		.limit(1);

	if (defaultRow) return mapCar(defaultRow);

	const [first] = await db
		.select()
		.from(cars)
		.where(eq(cars.userId, userId))
		.orderBy(desc(cars.createdAt))
		.limit(1);

	return first ? mapCar(first) : null;
}

async function clearDefaults(userId: string, exceptCarId?: string) {
	const where = exceptCarId
		? and(eq(cars.userId, userId), ne(cars.id, exceptCarId))
		: eq(cars.userId, userId);

	await db
		.update(cars)
		.set({ isDefault: false, updatedAt: new Date() })
		.where(where);
}

/** Create a car. Enforces single-default when `isDefault` is true. */
export async function createCar(userId: string, input: CreateCarInput): Promise<Car> {
	const isDefault = input.isDefault ?? false;

	if (isDefault) {
		await clearDefaults(userId);
	}

	const [row] = await db
		.insert(cars)
		.values({
			userId,
			brand: input.brand,
			model: input.model,
			year: input.year,
			licensePlate: input.licensePlate ?? null,
			pictureUrl: input.pictureUrl ?? null,
			isDefault
		})
		.returning();

	return mapCar(row);
}

/**
 * Update a car owned by the user.
 * Throws if the car does not exist or is not owned by `userId`.
 */
export async function updateCar(
	userId: string,
	carId: string,
	updates: UpdateCarInput
): Promise<Car> {
	const existing = await getCarById(userId, carId);
	if (!existing) {
		throw new Error('Car not found');
	}

	if (updates.isDefault === true) {
		await clearDefaults(userId, carId);
	}

	const [row] = await db
		.update(cars)
		.set({
			...(updates.brand !== undefined ? { brand: updates.brand } : {}),
			...(updates.model !== undefined ? { model: updates.model } : {}),
			...(updates.year !== undefined ? { year: updates.year } : {}),
			...(updates.licensePlate !== undefined ? { licensePlate: updates.licensePlate } : {}),
			...(updates.pictureUrl !== undefined ? { pictureUrl: updates.pictureUrl } : {}),
			...(updates.isDefault !== undefined ? { isDefault: updates.isDefault } : {}),
			updatedAt: new Date()
		})
		.where(and(eq(cars.id, carId), eq(cars.userId, userId)))
		.returning();

	if (!row) {
		throw new Error('Car not found');
	}

	return mapCar(row);
}

/**
 * Delete a car owned by the user.
 * Fuel logs cascade via FK. If it was default, promotes another car.
 */
export async function deleteCar(userId: string, carId: string): Promise<void> {
	const existing = await getCarById(userId, carId);
	if (!existing) {
		throw new Error('Car not found');
	}

	await db.delete(cars).where(and(eq(cars.id, carId), eq(cars.userId, userId)));

	if (existing.isDefault) {
		const [next] = await db
			.select()
			.from(cars)
			.where(eq(cars.userId, userId))
			.orderBy(desc(cars.createdAt))
			.limit(1);

		if (next) {
			await db
				.update(cars)
				.set({ isDefault: true, updatedAt: new Date() })
				.where(and(eq(cars.id, next.id), eq(cars.userId, userId)));
		}
	}
}

/** Delete all cars and fuel logs for a user (keeps the account). */
export async function resetUserData(userId: string): Promise<void> {
	await db.delete(fuelLogs).where(eq(fuelLogs.userId, userId));
	await db.delete(cars).where(eq(cars.userId, userId));
}
