import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireUser } from '$lib/auth';
import { resetUserData } from '$lib/db/queries/cars';

export const POST: RequestHandler = async (event) => {
	const user = await requireUser(event);
	await resetUserData(user.id);
	return json({ ok: true });
};
