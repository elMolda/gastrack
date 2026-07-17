<script lang="ts">
	import { t } from '$lib/i18n';
	import { updateCar } from '$lib/db/queries/cars';
	import { goto } from '$app/navigation';
	import Navbar from '$lib/components/ui/Navbar.svelte';
	import type { Database } from '$lib/db/schema';

	type DbCar = Database['public']['Tables']['cars']['Row'];

	const { data } = $props<{ data: { car: DbCar } }>();

	let brand = $state(data.car.brand);
	let model = $state(data.car.model);
	let year = $state(String(data.car.year));
	let licensePlate = $state(data.car.license_plate || '');
	let isDefault = $state(data.car.is_default);
	let loading = $state(false);
	let errorMessage = $state('');

	async function handleSubmit(e: Event) {
		e.preventDefault();
		loading = true;
		errorMessage = '';

		try {
			await updateCar(data.car.id, {
				brand,
				model,
				year: parseInt(year),
				license_plate: licensePlate || null,
				is_default: isDefault
			});

			goto('/cars');
		} catch (err) {
			console.error('Error updating car:', err);
			errorMessage = t('cars.saveFailed');
		} finally {
			loading = false;
		}
	}
</script>

<div class="max-w-md mx-auto bg-slate-50 min-h-screen shadow-xl relative pb-28">
	<div class="bg-dark text-white px-5 pt-10 pb-6 rounded-b-[2rem] shadow-lg">
		<div class="flex justify-between items-center mb-6">
			<a href="/cars" class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300" aria-label={t('common.goBack')}>
				<i class="fas fa-chevron-left"></i>
			</a>
			<h1 class="text-xl font-semibold tracking-wide text-white">{t('cars.editCar')}</h1>
			<button onclick={handleSubmit} disabled={loading} class="text-white font-semibold tracking-wide hover:text-primary/80 transition disabled:opacity-50">{t('common.save')}</button>
		</div>
	</div>

	<form onsubmit={handleSubmit} class="p-6 space-y-6">
		<div class="grid grid-cols-2 gap-4">
			<div class="space-y-1.5">
				<label for="carBrand" class="text-xs font-bold text-slate-500 uppercase ml-1">{t('cars.brand')}</label>
				<input
					id="carBrand"
					type="text"
					placeholder={t('cars.brandPlaceholder')}
					bind:value={brand}
					class="w-full bg-white border border-slate-200 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-primary shadow-sm text-slate-900"
					required
				/>
			</div>
			<div class="space-y-1.5">
				<label for="carModel" class="text-xs font-bold text-slate-500 uppercase ml-1">{t('cars.model')}</label>
				<input
					id="carModel"
					type="text"
					placeholder={t('cars.modelPlaceholder')}
					bind:value={model}
					class="w-full bg-white border border-slate-200 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-primary shadow-sm text-slate-900"
					required
				/>
			</div>
		</div>

		<div class="space-y-1.5">
			<label for="carYear" class="text-xs font-bold text-slate-500 uppercase ml-1">{t('cars.year')}</label>
			<input
				id="carYear"
				type="number"
				placeholder={t('cars.yearPlaceholder')}
				bind:value={year}
				class="w-full bg-white border border-slate-200 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-primary shadow-sm text-slate-900"
				required
			/>
		</div>

		<div class="space-y-1.5">
			<label for="carLicensePlate" class="text-xs font-bold text-slate-500 uppercase ml-1">{t('cars.licensePlate')}</label>
			<input
				id="carLicensePlate"
				type="text"
				placeholder={t('cars.licensePlatePlaceholder')}
				bind:value={licensePlate}
				class="w-full bg-white border border-slate-200 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-primary shadow-sm text-slate-900"
			/>
		</div>

		<div class="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
			<div>
				<p class="text-sm font-bold text-slate-700">{t('cars.setAsDefault')}</p>
				<p class="text-xs text-slate-500">{t('cars.setAsDefaultDescription')}</p>
			</div>
			<label class="relative inline-flex items-center cursor-pointer">
				<input type="checkbox" bind:checked={isDefault} class="sr-only peer">
				<div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
			</label>
		</div>

		{#if errorMessage}
			<div class="text-red-500 text-sm text-center p-2 bg-red-50 rounded-lg">{errorMessage}</div>
		{/if}

		<button type="submit" disabled={loading} class="w-full bg-primary hover:bg-sky-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition disabled:opacity-50">
			{loading ? t('cars.saving') : t('common.save')}
		</button>
	</form>

	<Navbar active="cars" />
</div>
