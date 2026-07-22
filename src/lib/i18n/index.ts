import { browser } from '$app/environment';
import { get, writable } from 'svelte/store';

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
			pessimistic: 'Pessimistic',
			filledDistance: 'Filled {distance} {unit}',
			dashboardRead: 'Dashboard read:'
		},
		// Cars
		cars: {
			addCar: 'Add Your Vehicle',
			editCar: 'Edit Vehicle',
			brand: 'Brand',
			model: 'Model',
			year: 'Year',
			licensePlate: 'License Plate (Optional)',
			carPicture: 'Car Picture (Optional)',
			uploadImage: 'Upload Image',
			finishSetup: 'Finish Setup',
			manageCars: 'Manage Vehicles',
			defaultVehicle: 'Default Vehicle',
			setAsDefault: 'Set as default vehicle',
			setAsDefaultDescription: 'This car will be selected for new fuel logs',
			noPlate: 'No plate',
			noVehicles: 'No vehicles yet',
			noVehiclesDescription: 'Add your first vehicle to start tracking fuel efficiency',
			deleteCar: 'Delete Vehicle',
			deleteConfirm: 'Delete {brand} {model}? All fuel logs for this vehicle will also be removed.',
			deleteLastCarWarning: 'This is your only vehicle. You will need to add a new one to continue tracking.',
			saving: 'Saving...',
			deleting: 'Deleting...',
			brandPlaceholder: 'e.g. VW',
			modelPlaceholder: 'e.g. Voyage',
			yearPlaceholder: '2019',
			licensePlatePlaceholder: 'ABC-123',
			saveFailed: 'Failed to save vehicle. Please try again.',
			deleteFailed: 'Failed to delete vehicle. Please try again.'
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
			back: 'Back',
			efficiencyPlaceholder: 'e.g. 10.5',
			normalizedDashboardRead: 'Normalized dashboard read:',
			pumpComparison: 'Your real pump math is {percentage}% {comparison} than what your car displays.',
			better: 'better',
			worse: 'worse'
		},
		auth: {
			signInSubtitle: 'Sign in to your fuel analytics',
			email: 'Email',
			password: 'Password',
			username: 'Username',
			emailPlaceholder: 'name@example.com',
			usernamePlaceholder: 'Driver123',
			signingIn: 'Signing in...',
			signIn: 'Sign In',
			signInFailed: 'Unable to sign in. Check your email and password.',
			register: 'Register',
			noAccount: "Don't have an account?",
			createAccount: 'Create Account',
			creatingAccount: 'Creating account...',
			registrationFailed: 'Unable to create your account. Please try again.',
			continue: 'Continue',
			hasAccount: 'Already have an account?',
			checkingAuthentication: 'Checking authentication...',
			notAuthenticated: 'User not authenticated. Please try again.',
			or: 'or',
			continueWithGoogle: 'Continue with Google'
		},
		layout: {
			switchToSpanish: 'Switch to Spanish',
			switchToEnglish: 'Switch to English'
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
			buildDateValue: 'July 2026',
			developer: 'Developer',
			supportFeedback: 'Support & Feedback',
			helpSupport: 'Help & Support',
			helpSupportDescription: 'Get help with the app',
			sendFeedback: 'Send Feedback',
			sendFeedbackDescription: 'Share your thoughts',
			dangerZone: 'Danger Zone',
			resetAllData: 'Reset All Data',
			resetWarning: 'This will delete all your fuel logs and car data. This action cannot be undone.',
			resetConfirm: 'Are you sure you want to delete all fuel logs and vehicles? Your account will be kept.',
			resetting: 'Resetting...',
			resetFailed: 'Failed to reset data. Please try again.',
			selectEnglish: 'Select English language',
			selectSpanish: 'Select Spanish language',
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
			no: 'No',
			goBack: 'Go back',
			moreOptions: 'More options',
			unexpectedError: 'An unexpected error occurred',
			notAvailable: 'N/A',
			total: 'total'
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
			pessimistic: 'Pesimista',
			filledDistance: 'Carga de {distance} {unit}',
			dashboardRead: 'Lectura del tablero:'
		},
		// Cars
		cars: {
			addCar: 'Agregar Vehículo',
			editCar: 'Editar Vehículo',
			brand: 'Marca',
			model: 'Modelo',
			year: 'Año',
			licensePlate: 'Placa (Opcional)',
			carPicture: 'Foto del Auto (Opcional)',
			uploadImage: 'Subir Imagen',
			finishSetup: 'Finalizar Configuración',
			manageCars: 'Administrar Vehículos',
			defaultVehicle: 'Vehículo Predeterminado',
			setAsDefault: 'Establecer como vehículo predeterminado',
			setAsDefaultDescription: 'Este auto se seleccionará para nuevos registros de combustible',
			noPlate: 'Sin placa',
			noVehicles: 'Aún no hay vehículos',
			noVehiclesDescription: 'Agrega tu primer vehículo para comenzar a rastrear la eficiencia del combustible',
			deleteCar: 'Eliminar Vehículo',
			deleteConfirm: '¿Eliminar {brand} {model}? También se eliminarán todos los registros de combustible de este vehículo.',
			deleteLastCarWarning: 'Este es tu único vehículo. Necesitarás agregar uno nuevo para continuar.',
			saving: 'Guardando...',
			deleting: 'Eliminando...',
			brandPlaceholder: 'p. ej., VW',
			modelPlaceholder: 'p. ej., Voyage',
			yearPlaceholder: '2019',
			licensePlatePlaceholder: 'ABC-123',
			saveFailed: 'No se pudo guardar el vehículo. Inténtalo de nuevo.',
			deleteFailed: 'No se pudo eliminar el vehículo. Inténtalo de nuevo.'
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
			back: 'Atrás',
			efficiencyPlaceholder: 'p. ej., 10.5',
			normalizedDashboardRead: 'Lectura normalizada del tablero:',
			pumpComparison: 'El cálculo real en la bomba es {percentage}% {comparison} que lo que muestra tu auto.',
			better: 'mejor',
			worse: 'peor'
		},
		auth: {
			signInSubtitle: 'Ingresa a tus análisis de combustible',
			email: 'Correo electrónico',
			password: 'Contraseña',
			username: 'Nombre de usuario',
			emailPlaceholder: 'nombre@ejemplo.com',
			usernamePlaceholder: 'Conductor123',
			signingIn: 'Iniciando sesión...',
			signIn: 'Iniciar sesión',
			signInFailed: 'No se pudo iniciar sesión. Revisa tu correo y contraseña.',
			register: 'Registrarse',
			noAccount: '¿No tienes una cuenta?',
			createAccount: 'Crear cuenta',
			creatingAccount: 'Creando cuenta...',
			registrationFailed: 'No se pudo crear tu cuenta. Inténtalo de nuevo.',
			continue: 'Continuar',
			hasAccount: '¿Ya tienes una cuenta?',
			checkingAuthentication: 'Verificando autenticación...',
			notAuthenticated: 'Usuario no autenticado. Inténtalo de nuevo.',
			or: 'o',
			continueWithGoogle: 'Continuar con Google'
		},
		layout: {
			switchToSpanish: 'Cambiar a español',
			switchToEnglish: 'Cambiar a inglés'
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
			buildDateValue: 'Julio de 2026',
			developer: 'Desarrollador',
			supportFeedback: 'Soporte & Comentarios',
			helpSupport: 'Ayuda & Soporte',
			helpSupportDescription: 'Obtener ayuda con la app',
			sendFeedback: 'Enviar Comentarios',
			sendFeedbackDescription: 'Comparte tus pensamientos',
			dangerZone: 'Zona de Peligro',
			resetAllData: 'Restablecer Todos los Datos',
			resetWarning: 'Esto eliminará todos tus registros de combustible y datos de autos. Esta acción no se puede deshacer.',
			resetConfirm: '¿Estás seguro de que deseas eliminar todos los registros de combustible y vehículos? Tu cuenta se mantendrá.',
			resetting: 'Restableciendo...',
			resetFailed: 'No se pudieron restablecer los datos. Inténtalo de nuevo.',
			selectEnglish: 'Seleccionar idioma inglés',
			selectSpanish: 'Seleccionar idioma español',
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
			no: 'No',
			goBack: 'Volver',
			moreOptions: 'Más opciones',
			unexpectedError: 'Ocurrió un error inesperado',
			notAvailable: 'No disponible',
			total: 'total'
		}
	}
} as const;

// Language store
const storedLang = browser ? localStorage.getItem('language') as Language : 'en';
const defaultLang: Language = storedLang && (storedLang === 'en' || storedLang === 'es') ? storedLang : 'en';

export const currentLanguage = writable<Language>(defaultLang);

// Translation function — reads current language via get() so callers stay simple.
// Components remount/re-render when language changes via `{#key $currentLanguage}`.
export function t(key: string, params: Record<string, string> = {}): string {
	const currentLang = get(currentLanguage);
	let translation: any = translations[currentLang];

	for (const k of key.split('.')) {
		translation = translation?.[k];
		if (translation == null) {
			console.warn(`Translation key not found: ${key}`);
			return key;
		}
	}

	let result = String(translation);
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