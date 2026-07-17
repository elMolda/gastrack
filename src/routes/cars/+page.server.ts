import { createServerSupabaseFromCookies } from '$lib/db/client';
import { error, redirect } from '@sveltejs/kit';

export async function load({ locals, cookies }: { locals: App.Locals; cookies: { get: (key: string) => string | undefined } }) {
	const session = locals.session;
	if (!session) {
		throw redirect(303, '/auth/login');
	}

	const supabase = createServerSupabaseFromCookies(cookies);

	const { data: cars, error: carsError } = await supabase
		.from('cars')
		.select('*')
		.eq('user_id', session.user.id)
		.order('created_at', { ascending: false });

	if (carsError) {
		console.error('Error fetching cars:', carsError);
		throw error(500, 'Failed to load vehicles');
	}

	return { cars: cars || [] };
}
