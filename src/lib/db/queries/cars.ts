import { supabase } from '../client';
import type { Database } from '../schema';

type Car = Database['public']['Tables']['cars']['Row'];
type CarInsert = Database['public']['Tables']['cars']['Insert'];
type CarUpdate = Database['public']['Tables']['cars']['Update'];

// Get all cars for the current user
export async function getUserCars(userId: string): Promise<Car[]> {
	const { data, error } = await supabase
		.from('cars')
		.select('*')
		.eq('user_id', userId)
		.order('created_at', { ascending: false });

	if (error) {
		console.error('Error fetching user cars:', error);
		throw error;
	}

	return data || [];
}

// Get a single car by ID
export async function getCarById(carId: string): Promise<Car | null> {
	const { data, error } = await supabase
		.from('cars')
		.select('*')
		.eq('id', carId)
		.single();

	if (error) {
		console.error('Error fetching car:', error);
		return null;
	}

	return data;
}

// Get user's default car
export async function getDefaultCar(userId: string): Promise<Car | null> {
	const { data, error } = await supabase
		.from('cars')
		.select('*')
		.eq('user_id', userId)
		.eq('is_default', true)
		.limit(1)
		.single();

	if (error) {
		// If no default car, get the first car
		const { data: cars } = await supabase
			.from('cars')
			.select('*')
			.eq('user_id', userId)
			.limit(1)
			.single();

		return cars;
	}

	return data;
}

// Create a new car
export async function createCar(carData: CarInsert): Promise<Car> {
	// If this car is set as default, unset other defaults
	if (carData.is_default) {
		const { error: clearDefaultsError } = await supabase
			.from('cars')
			.update({ is_default: false })
			.eq('user_id', carData.user_id);

		if (clearDefaultsError) {
			console.error('Error clearing default car:', clearDefaultsError);
			throw clearDefaultsError;
		}
	}

	const { data, error } = await supabase
		.from('cars')
		.insert(carData)
		.select()
		.single();

	if (error) {
		console.error('Error creating car:', error);
		throw error;
	}

	return data;
}

// Update a car
export async function updateCar(carId: string, updates: CarUpdate): Promise<Car> {
	// If setting as default, unset other defaults
	if (updates.is_default) {
		const { data: car } = await supabase
			.from('cars')
			.select('user_id')
			.eq('id', carId)
			.single();

		if (car) {
			const { error: clearDefaultsError } = await supabase
				.from('cars')
				.update({ is_default: false })
				.eq('user_id', car.user_id)
				.neq('id', carId);

			if (clearDefaultsError) {
				console.error('Error clearing default car:', clearDefaultsError);
				throw clearDefaultsError;
			}
		}
	}

	const { data, error } = await supabase
		.from('cars')
		.update(updates)
		.eq('id', carId)
		.select()
		.single();

	if (error) {
		console.error('Error updating car:', error);
		throw error;
	}

	return data;
}

// Delete a car and its associated fuel logs
export async function deleteCar(carId: string): Promise<void> {
	const { error: logsError } = await supabase
		.from('fuel_logs')
		.delete()
		.eq('car_id', carId);

	if (logsError) {
		console.error('Error deleting car fuel logs:', logsError);
		throw logsError;
	}

	const { error } = await supabase
		.from('cars')
		.delete()
		.eq('id', carId);

	if (error) {
		console.error('Error deleting car:', error);
		throw error;
	}
}

// Delete all cars and fuel logs for a user (keeps the account)
export async function resetUserData(userId: string): Promise<void> {
	const { error: logsError } = await supabase
		.from('fuel_logs')
		.delete()
		.eq('user_id', userId);

	if (logsError) {
		console.error('Error deleting user fuel logs:', logsError);
		throw logsError;
	}

	const { error: carsError } = await supabase
		.from('cars')
		.delete()
		.eq('user_id', userId);

	if (carsError) {
		console.error('Error deleting user cars:', carsError);
		throw carsError;
	}
}