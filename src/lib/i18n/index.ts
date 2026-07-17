import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export type Language = 'en' | 'es';
export type TranslationKey = string;

// Translation data structure
const translations = {
	en: {
		// Dashboard
		dashboard: {
			title: 'Fuel Analytics',
			welcome: 'Welcome Back',
			avgEfficiency: 'Avg Efficiency',
			costPerKm: 'Cost / km',
			totalSpent: 'Total Spent',
			distance: 'Distance',
			totalFuel: 'Total Fuel',
			efficiencyTrend: 'Efficiency Trend (km/gal)',
			performanceByCondition: 'Performance by Condition',
			highwayPerformance: 'Highway Performance',
			mixedPerformance: 'Mixed Performance',
			cityPerformance: 'City Traffic Performance',
			onboardComputerAccuracy: 'On-Board Computer Accuracy',
			computerAccuracyDescription: 'Cross-comparing converted dashboard entries vs. real pump logic',
			historyLog: 'History Log',
			viewAll: 'View All',
			city: 'City',
			mixed: 'Mixed',
			highway: 'Highway',
			optimistic: 'Optimistic',
			pessimistic: 'Pessimistic'
		},
		// Cars
		cars: {
			addCar: 'Add Your Vehicle',
			brand: 'Brand',
			model: 'Model',
			year: 'Year',
			licensePlate: 'License Plate (Optional)',
			carPicture: 'Car Picture (Optional)',
			uploadImage: 'Upload Image',
			finishSetup: 'Finish Setup',
			manageCars: 'Manage Vehicles'
		},
		// Logs
		logs: {
			newFillUp: 'New Fill-Up',
			fillUpDate: 'Fill-up Date',
			distanceCovered: 'Distance Covered',
			fuelAdded: 'Fuel Added',
			pricePerUnit: 'Price per {unit}',
			driveConditions: 'Drive Conditions',
			carComputerReadout: 'Car Computer Readout',
			dashboardEfficiency: 'Dashboard Efficiency & Independent Unit',
			efficiencyPreview: 'Efficiency Preview',
			calculatedCost: 'Calculated Cost',
			saveLogEntry: 'Save Log Entry',
			save: 'Save',
			back: 'Back'
		},
		// Navigation
		nav: {
			dashboard: 'Dashboard',
			addLog: 'Add Log',
			cars: 'Cars',
			settings: 'Settings'
		},
		// Units
		units: {
			km: 'km',
			mi: 'mi',
			gal: 'gal',
			L: 'L',
			kmPerGal: 'km/gal',
			kmPerL: 'km/L',
			mpg: 'MPG',
			lPer100km: 'L/100km'
		},
		// Settings
		settings: {
			language: 'Language',
			english: 'English',
			englishDescription: 'Use English interface',
			spanish: 'Español',
			spanishDescription: 'Usar interfaz en español',
			saveLanguage: 'Save Language',
			appInfo: 'App Information',
			version: 'Version',
			buildDate: 'Build Date',
			developer: 'Developer',
			supportFeedback: 'Support & Feedback',
			helpSupport: 'Help & Support',
			helpSupportDescription: 'Get help with the app',
			sendFeedback: 'Send Feedback',
			sendFeedbackDescription: 'Share your thoughts',
			dangerZone: 'Danger Zone',
			resetAllData: 'Reset All Data',
			resetWarning: 'This will delete all your fuel logs and car data. This action cannot be undone.',
			account: 'Account',
			signedIn: 'Signed in',
			logout: 'Logout',
			loading: 'Loading...'
		},
		// Common
		common: {
			loading: 'Loading...',
			save: 'Save',
			cancel: 'Cancel',
			delete: 'Delete',
			edit: 'Edit',
			yes: 'Yes',
			no: 'No'
		}
	},
	es: {
		// Dashboard
		dashboard: {
			title: 'Análisis de Combustible',
			welcome: 'Bienvenido de Nuevo',
			avgEfficiency: 'Eficiencia Promedio',
			costPerKm: 'Costo / km',
			totalSpent: 'Total Gastado',
			distance: 'Distancia',
			totalFuel: 'Combustible Total',
			efficiencyTrend: 'Tendencia de Eficiencia (km/gal)',
			performanceByCondition: 'Rendimiento por Condición',
			highwayPerformance: 'Rendimiento en Carretera',
			mixedPerformance: 'Rendimiento Mixto',
			cityPerformance: 'Rendimiento en Ciudad',
			onboardComputerAccuracy: 'Precisión de la Computadora',
			computerAccuracyDescription: 'Comparando lecturas del tablero vs. cálculos reales de bomba',
			historyLog: 'Historial',
			viewAll: 'Ver Todo',
			city: 'Ciudad',
			mixed: 'Mixto',
			highway: 'Carretera',
			optimistic: 'Optimista',
			pessimistic: 'Pesimista'
		},
		// Cars
		cars: {
			addCar: 'Agregar Vehículo',
			brand: 'Marca',
			model: 'Modelo',
			year: 'Año',
			licensePlate: 'Placa (Opcional)',
			carPicture: 'Foto del Auto (Opcional)',
			uploadImage: 'Subir Imagen',
			finishSetup: 'Finalizar Configuración',
			manageCars: 'Administrar Vehículos'
		},
		// Logs
		logs: {
			newFillUp: 'Nuevo Llenado',
			fillUpDate: 'Fecha de Llenado',
			distanceCovered: 'Distancia Recorrida',
			fuelAdded: 'Combustible Agregado',
			pricePerUnit: 'Precio por {unit}',
			driveConditions: 'Condiciones de Conducción',
			carComputerReadout: 'Lectura de Computadora',
			dashboardEfficiency: 'Eficiencia del Tablero & Unidad Independiente',
			efficiencyPreview: 'Vista Previa de Eficiencia',
			calculatedCost: 'Costo Calculado',
			saveLogEntry: 'Guardar Registro',
			save: 'Guardar',
			back: 'Atrás'
		},
		// Navigation
		nav: {
			dashboard: 'Tablero',
			addLog: 'Agregar Registro',
			cars: 'Autos',
			settings: 'Configuración'
		},
		// Units
		units: {
			km: 'km',
			mi: 'mi',
			gal: 'gal',
			L: 'L',
			kmPerGal: 'km/gal',
			kmPerL: 'km/L',
			mpg: 'MPG',
			lPer100km: 'L/100km'
		},
		// Settings
		settings: {
			language: 'Idioma',
			english: 'Inglés',
			englishDescription: 'Usar interfaz en inglés',
			spanish: 'Español',
			spanishDescription: 'Usar interfaz en español',
			saveLanguage: 'Guardar Idioma',
			appInfo: 'Información de la App',
			version: 'Versión',
			buildDate: 'Fecha de Compilación',
			developer: 'Desarrollador',
			supportFeedback: 'Soporte & Comentarios',
			helpSupport: 'Ayuda & Soporte',
			helpSupportDescription: 'Obtener ayuda con la app',
			sendFeedback: 'Enviar Comentarios',
			sendFeedbackDescription: 'Comparte tus pensamientos',
			dangerZone: 'Zona de Peligro',
			resetAllData: 'Restablecer Todos los Datos',
			resetWarning: 'Esto eliminará todos tus registros de combustible y datos de autos. Esta acción no se puede deshacer.',
			account: 'Cuenta',
			signedIn: 'Conectado',
			logout: 'Cerrar Sesión',
			loading: 'Cargando...'
		},
		// Common
		common: {
			loading: 'Cargando...',
			save: 'Guardar',
			cancel: 'Cancelar',
			delete: 'Eliminar',
			edit: 'Editar',
			yes: 'Sí',
			no: 'No'
		}
	}
} as const;

// Language store
const storedLang = browser ? localStorage.getItem('language') as Language : 'en';
const defaultLang: Language = storedLang && (storedLang === 'en' || storedLang === 'es') ? storedLang : 'en';

export const currentLanguage = writable<Language>(defaultLang);

// Translation function
export function t(key: string, params: Record<string, string> = {}): string {
	let translation: any = translations;
	const keys = key.split('.');
	
	// Get current language value
	let currentLang: Language = 'en';
	currentLanguage.subscribe(value => { currentLang = value; })();
	
	// Navigate through translation object
	// Start with the language-specific translations
	translation = translation[currentLang];
	
	for (const k of keys) {
		translation = translation[k];
		if (!translation) {
			console.warn(`Translation key not found: ${key}`);
			return key;
		}
	}
	
	// Replace parameters
	let result = translation;
	for (const [param, value] of Object.entries(params)) {
		result = result.replace(`{${param}}`, value);
	}
	
	return result;
}

// Change language
export function setLanguage(lang: Language): void {
	currentLanguage.set(lang);
	if (browser) {
		localStorage.setItem('language', lang);
	}
}

// Initialize
if (browser) {
	currentLanguage.subscribe(lang => {
		document.documentElement.lang = lang;
	});
}