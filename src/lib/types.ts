// Fuel log types
export type DistanceUnit = 'km' | 'mi';
export type FuelUnit = 'gal' | 'L';
export type EfficiencyUnit = 'km/gal' | 'km/L' | 'MPG' | 'L/100km';
export type DriveType = 'city' | 'mixed' | 'highway';

export interface FuelLog {
	id: string;
	date: string;
	distance: number;
	distUnit: DistanceUnit;
	fuel: number;
	fuelUnit: FuelUnit;
	price: number;
	driveType: DriveType;
	carReported: number | null;
	carReportedUnit: EfficiencyUnit | null;
	carId?: string; // Associated car
}

// Car types
export interface Car {
	id: string;
	brand: string;
	model: string;
	year: number;
	licensePlate?: string;
	pictureUrl?: string;
	createdAt: string;
	isDefault: boolean;
}

// User types (for future auth)
export interface User {
	id: string;
	username: string;
	email: string;
	createdAt: string;
}

// Dashboard statistics
export interface DashboardStats {
	totalKm: number;
	totalGal: number;
	avgEfficiency: number;
	totalSpent: number;
	avgCostPerKm: number;
	driveTypeStats: {
		highway: number;
		mixed: number;
		city: number;
	};
	calculationDeviation: number;
}

// Unit conversion helper
export function toKmPerGal(value: number, unit: EfficiencyUnit): number {
	if (!value || isNaN(value)) return 0;
	switch(unit) {
		case 'km/gal': return value;
		case 'km/L': return value * 3.78541; // 1 gallon = 3.78541 Liters
		case 'MPG': return value * 1.60934;   // 1 mile = 1.60934 km
		case 'L/100km': return value > 0 ? 378.541 / value : 0; 
		default: return value;
	}
}

// Calculate dashboard stats from logs
export function calculateDashboardStats(logs: FuelLog[]): DashboardStats {
	const totalKm = logs.reduce((acc, log) => acc + log.distance, 0);
	const totalGal = logs.reduce((acc, log) => acc + log.fuel, 0);
	const avgEfficiency = totalGal > 0 ? totalKm / totalGal : 0;
	const totalSpent = logs.reduce((acc, log) => acc + (log.fuel * log.price), 0);
	const avgCostPerKm = totalKm > 0 ? totalSpent / totalKm : 0;

	const getDriveTypeStats = (type: DriveType) => {
		const filtered = logs.filter(l => l.driveType === type);
		if (!filtered.length) return 0;
		const dist = filtered.reduce((acc, l) => acc + l.distance, 0);
		const fl = filtered.reduce((acc, l) => acc + l.fuel, 0);
		return fl > 0 ? dist / fl : 0;
	};

	// Cross-unit discrepancy calculation
	const reportedLogs = logs.filter(l => l.carReported && l.carReportedUnit);
	const totalNormalizedReported = reportedLogs.reduce((acc, l) => 
		acc + toKmPerGal(l.carReported!, l.carReportedUnit!), 0);
	const avgReportedKmPerGal = reportedLogs.length ? totalNormalizedReported / reportedLogs.length : 0;
	const calculationDeviation = avgReportedKmPerGal > 0 
		? ((avgEfficiency - avgReportedKmPerGal) / avgReportedKmPerGal) * 100
		: 0;

	return {
		totalKm,
		totalGal,
		avgEfficiency,
		totalSpent,
		avgCostPerKm,
		driveTypeStats: {
			highway: getDriveTypeStats('highway'),
			mixed: getDriveTypeStats('mixed'),
			city: getDriveTypeStats('city')
		},
		calculationDeviation
	};
}