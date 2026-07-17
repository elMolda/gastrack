<script lang="ts">
	import { t } from '$lib/i18n';
	import type { Car } from '$lib/types';
	import Navbar from '$lib/components/ui/Navbar.svelte';

	// Sample car data
	const initialCars: Car[] = $state([
		{ id: 1, brand: 'VW', model: 'Voyage', year: 2019, licensePlate: 'ABC-123', isDefault: true, createdAt: '2026-07-01' },
		{ id: 2, brand: 'Toyota', model: 'Corolla', year: 2021, licensePlate: 'XYZ-789', isDefault: false, createdAt: '2026-07-10' }
	]);

	const cars = $state(initialCars);
</script>

<div class="max-w-md mx-auto bg-slate-50 min-h-screen shadow-xl relative pb-28">
	<!-- Header -->
	<div class="bg-dark text-white px-5 pt-10 pb-6 rounded-b-[2rem] shadow-lg">
		<div class="flex justify-between items-center mb-6">
			<a href="/" class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300" aria-label="Go back">
				<i class="fas fa-chevron-left"></i>
			</a>
			<h1 class="text-xl font-semibold tracking-wide text-white">{t('cars.manageCars')}</h1>
			<a href="/cars/new" class="text-white font-semibold tracking-wide hover:text-primary/80 transition">{t('common.save')}</a>
		</div>
	</div>

	<!-- Content -->
	<div class="p-6 space-y-6">
		<!-- Add New Car Button -->
		<a href="/cars/new" class="block w-full bg-primary hover:bg-sky-600 text-white font-bold text-md py-4 rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition text-center">
			<i class="fas fa-plus mr-2"></i>
			{t('cars.addCar')}
		</a>

		<!-- Car List -->
		<div class="space-y-4">
			{#each cars as car}
				<div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
					<div class="flex items-start justify-between">
						<div class="flex items-start gap-3">
							<div class="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
								<i class="fas fa-car text-slate-400 text-xl"></i>
							</div>
							<div>
								<h3 class="font-bold text-slate-800">{car.brand} {car.model}</h3>
								<p class="text-sm text-slate-500">{car.year} • {car.licensePlate || 'No plate'}</p>
								{#if car.isDefault}
									<span class="inline-block mt-1 text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
										Default Vehicle
									</span>
								{/if}
							</div>
						</div>
						<button class="text-slate-400 hover:text-slate-600" aria-label="More options">
							<i class="fas fa-ellipsis-v"></i>
						</button>
					</div>
				</div>
			{/each}
		</div>

		<!-- Empty State -->
		{#if cars.length === 0}
			<div class="text-center py-12">
				<div class="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
					<i class="fas fa-car text-slate-400 text-2xl"></i>
				</div>
				<h3 class="text-lg font-bold text-slate-700 mb-2">No vehicles yet</h3>
				<p class="text-slate-500 text-sm">Add your first vehicle to start tracking fuel efficiency</p>
			</div>
		{/if}
	</div>

	<!-- Navigation Bar -->
	<Navbar active="cars" />
</div>