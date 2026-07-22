import { supabase } from '../client';
import type { Database } from '../supabase-types';

type FuelLog = Database['public']['Tables']['fuel_logs']['Row'];
type FuelLogInsert = Database['public']['Tables']['fuel_logs']['Insert'];
type FuelLogUpdate = Database['public']['Tables']['fuel_logs']['Update'];

// Get all fuel logs for the current user
export async function getUserFuelLogs(userId: string, limit?: number): Promise<FuelLog[]> {
	let query = supabase
		.from('fuel_logs')
		.select('*')
		.eq('user_id', userId)
		.order('date', { ascending: false });

	if (limit) {
		query = query.limit(limit);
	}

	const { data, error } = await query;

	if (error) {
		console.error('Error fetching user fuel logs:', error);
		throw error;
	}

	return data || [];
}

// Get fuel logs for a specific car
export async function getCarFuelLogs(carId: string, limit?: number): Promise<FuelLog[]> {
	let query = supabase
		.from('fuel_logs')
		.select('*')
		.eq('car_id', carId)
		.order('date', { ascending: false });

	if (limit) {
		query = query.limit(limit);
	}

	const { data, error } = await query;

	if (error) {
		console.error('Error fetching car fuel logs:', error);
		throw error;
	}

	return data || [];
}

// Get a single fuel log by ID
export async function getFuelLogById(logId: string): Promise<FuelLog | null> {
	const { data, error } = await supabase
		.from('fuel_logs')
		.select('*')
		.eq('id', logId)
		.single();

	if (error) {
		console.error('Error fetching fuel log:', error);
		return null;
	}

	return data;
}

// Create a new fuel log
export async function createFuelLog(logData: FuelLogInsert): Promise<FuelLog> {
	const { data, error } = await supabase
		.from('fuel_logs')
		.insert(logData)
		.select()
		.single();

	if (error) {
		console.error('Error creating fuel log:', error);
		throw error;
	}

	return data;
}

// Update a fuel log
export async function updateFuelLog(logId: string, updates: FuelLogUpdate): Promise<FuelLog> {
	const { data, error } = await supabase
		.from('fuel_logs')
		.update(updates)
		.eq('id', logId)
		.select()
		.single();

	if (error) {
		console.error('Error updating fuel log:', error);
		throw error;
	}

	return data;
}

// Delete a fuel log
export async function deleteFuelLog(logId: string): Promise<void> {
	const { error } = await supabase
		.from('fuel_logs')
		.delete()
		.eq('id', logId);

	if (error) {
		console.error('Error deleting fuel log:', error);
		throw error;
	}
}

// Get recent fuel logs with pagination
export async function getRecentFuelLogs(userId: string, page = 1, pageSize = 10): Promise<FuelLog[]> {
	const start = (page - 1) * pageSize;
	const end = start + pageSize - 1;

	const { data, error } = await supabase
		.from('fuel_logs')
		.select('*')
		.eq('user_id', userId)
		.order('date', { ascending: false })
		.range(start, end);

	if (error) {
		console.error('Error fetching recent fuel logs:', error);
		throw error;
	}

	return data || [];
}

// Get fuel logs statistics for dashboard
export async function getFuelLogsStats(userId: string): Promise<{
	totalLogs: number;
	totalDistance: number;
	totalFuel: number;
	totalSpent: number;
	avgEfficiency: number;
}> {
	const { data, error } = await supabase
		.from('fuel_logs')
		.select('distance, fuel, price')
		.eq('user_id', userId);

	if (error) {
		console.error('Error fetching fuel logs stats:', error);
		throw error;
	}

	const totalLogs = data.length;
	const totalDistance = data.reduce((sum, log) => sum + log.distance, 0);
	const totalFuel = data.reduce((sum, log) => sum + log.fuel, 0);
	const totalSpent = data.reduce((sum, log) => sum + (log.fuel * log.price), 0);
	const avgEfficiency = totalFuel > 0 ? totalDistance / totalFuel : 0;

	return {
		totalLogs,
		totalDistance,
		totalFuel,
		totalSpent,
		avgEfficiency
	};
}