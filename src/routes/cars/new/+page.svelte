<script lang="ts">
	import { t } from '$lib/i18n';
	import { enhance } from '$app/forms';
	import Navbar from '$lib/components/ui/Navbar.svelte';

	let { form } = $props();
	let isDefault = $state(true);
	let loading = $state(false);
</script>

<div class="max-w-md mx-auto bg-slate-50 min-h-screen shadow-xl relative pb-28">
	<div class="bg-dark text-white px-5 pt-10 pb-6 rounded-b-[2rem] shadow-lg">
		<div class="flex justify-between items-center mb-6">
			<a href="/cars" class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300" aria-label={t('common.goBack')}>
				<i class="fas fa-chevron-left"></i>
			</a>
			<h1 class="text-xl font-semibold tracking-wide text-white">{t('cars.addCar')}</h1>
			<div class="w-10"></div>
		</div>
	</div>

	<form
		method="POST"
		use:enhance={() => {
			loading = true;
			return async ({ update }) => {
				await update();
				loading = false;
			};
		}}
		class="p-6 space-y-6"
	>
		<div class="grid grid-cols-2 gap-4">
			<div class="space-y-1.5">
				<label for="carBrand" class="text-xs font-bold text-slate-500 uppercase ml-1">{t('cars.brand')}</label>
				<input
					id="carBrand"
					name="brand"
					type="text"
					placeholder={t('cars.brandPlaceholder')}
					class="w-full bg-white border border-slate-200 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-primary shadow-sm text-slate-900"
					required
				/>
			</div>
			<div class="space-y-1.5">
				<label for="carModel" class="text-xs font-bold text-slate-500 uppercase ml-1">{t('cars.model')}</label>
				<input
					id="carModel"
					name="model"
					type="text"
					placeholder={t('cars.modelPlaceholder')}
					class="w-full bg-white border border-slate-200 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-primary shadow-sm text-slate-900"
					required
				/>
			</div>
		</div>

		<div class="space-y-1.5">
			<label for="carYear" class="text-xs font-bold text-slate-500 uppercase ml-1">{t('cars.year')}</label>
			<input
				id="carYear"
				name="year"
				type="number"
				placeholder={t('cars.yearPlaceholder')}
				class="w-full bg-white border border-slate-200 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-primary shadow-sm text-slate-900"
				required
			/>
		</div>

		<div class="space-y-1.5">
			<label for="carLicensePlate" class="text-xs font-bold text-slate-500 uppercase ml-1">{t('cars.licensePlate')}</label>
			<input
				id="carLicensePlate"
				name="licensePlate"
				type="text"
				placeholder={t('cars.licensePlatePlaceholder')}
				pattern={'[A-Za-z]{3}[- ]?[0-9]{3}'}
				maxlength="7"
				title={t('cars.invalidLicensePlate')}
				class="w-full bg-white border border-slate-200 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-primary shadow-sm text-slate-900 uppercase"
			/>
		</div>

		<div class="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
			<div>
				<p class="text-sm font-bold text-slate-700">{t('cars.setAsDefault')}</p>
				<p class="text-xs text-slate-500">{t('cars.setAsDefaultDescription')}</p>
			</div>
			<label class="relative inline-flex items-center cursor-pointer">
				<input type="checkbox" name="isDefault" bind:checked={isDefault} class="sr-only peer" />
				<div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
			</label>
		</div>

		{#if form?.error === 'invalid_license_plate'}
			<div class="text-red-500 text-sm text-center p-2 bg-red-50 rounded-lg">{t('cars.invalidLicensePlate')}</div>
		{:else if form?.error}
			<div class="text-red-500 text-sm text-center p-2 bg-red-50 rounded-lg">{t('cars.saveFailed')}</div>
		{/if}

		<button type="submit" disabled={loading} class="w-full bg-primary hover:bg-sky-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition disabled:opacity-50">
			{loading ? t('cars.saving') : t('cars.finishSetup')}
		</button>
	</form>

	<Navbar active="cars" />
</div>
