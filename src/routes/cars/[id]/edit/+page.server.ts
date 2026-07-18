import { createServerSupabaseFromCookies } from '$lib/db/server';
import { error, redirect } from '@sveltejs/kit';

export async function load({
	params,
	locals,
	cookies
}: {
	params: { id: string };
	locals: App.Locals;
	cookies: { get: (key: string) => string | undefined };
}) {
	const session = locals.session;
	if (!session) {
		throw redirect(303, '/auth/login');
	}

	const supabase = createServerSupabaseFromCookies(cookies);

	const { data: car, error: carError } = await supabase
		.from('cars')
		.select('*')
		.eq('id', params.id)
		.eq('user_id', session.user.id)
		.single();

	if (carError || !car) {
		throw redirect(303, '/cars');
	}

	return { car };
}
