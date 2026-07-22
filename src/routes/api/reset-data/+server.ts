import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { requireUser } from '$lib/auth';
import { db } from '$lib/db';
import { cars, fuelLogs } from '$lib/db/schema';

export const POST: RequestHandler = async (event) => {
	const user = await requireUser(event);

	await db.delete(fuelLogs).where(eq(fuelLogs.userId, user.id));
	await db.delete(cars).where(eq(cars.userId, user.id));

	return json({ ok: true });
};
