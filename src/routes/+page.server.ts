import { createServerSupabaseFromCookies } from '$lib/db/server';
import { calculateDashboardStats } from '$lib/types';
import type { FuelLog } from '$lib/types';
import { error, redirect } from '@sveltejs/kit';

export async function load({ locals, cookies }: any) {
	// Check if user is authenticated
	const session = locals.session;
	if (!session) {
		throw redirect(303, '/auth/login');
	}

	// Create a server-side Supabase client from cookies
	const supabase = createServerSupabaseFromCookies(cookies);

	try {
		// Get user's fuel logs from database
		const { data: fuelLogs, error: logsError } = await supabase
			.from('fuel_logs')
			.select('*')
			.eq('user_id', session.user.id)
			.order('date', { ascending: false });

		if (logsError) {
			console.error('Error fetching fuel logs:', logsError);
			throw error(500, 'Failed to load fuel logs');
		}

		// Get user's cars
		const { data: cars, error: carsError } = await supabase
			.from('cars')
			.select('*')
			.eq('user_id', session.user.id)
			.order('created_at', { ascending: false });

		if (carsError) {
			console.error('Error fetching cars:', carsError);
			throw error(500, 'Failed to load cars');
		}

		// Transform database logs to match our FuelLog type
		const transformedLogs: FuelLog[] = (fuelLogs || []).map(log => ({
			id: log.id,
			date: log.date,
			distance: log.distance,
			distUnit: log.dist_unit,
			fuel: log.fuel,
			fuelUnit: log.fuel_unit,
			price: log.price,
			driveType: log.drive_type,
			carReported: log.car_reported,
			carReportedUnit: log.car_reported_unit,
			carId: log.car_id
		}));

		// Calculate dashboard stats
		const stats = calculateDashboardStats(transformedLogs);

		return {
			logs: transformedLogs,
			stats,
			cars: cars || []
		};
	} catch (err) {
		console.error('Error loading dashboard data:', err);
		throw error(500, 'Failed to load dashboard data');
	}
}