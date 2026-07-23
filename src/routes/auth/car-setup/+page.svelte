<script lang="ts">
	import { t } from '$lib/i18n';
	import { enhance } from '$app/forms';

	let { form } = $props();
	let loading = $state(false);
</script>

<div class="max-w-md mx-auto bg-slate-50 min-h-screen shadow-xl p-6 flex flex-col justify-center">
	<div class="space-y-6">
		<h1 class="text-2xl font-bold text-dark">{t('cars.addCar')}</h1>

		<form
			method="POST"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					await update();
					loading = false;
				};
			}}
			class="space-y-4"
		>
			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-1.5">
					<label for="brand" class="text-xs font-bold text-slate-500 uppercase ml-1">{t('cars.brand')}</label>
					<input
						id="brand"
						name="brand"
						type="text"
						placeholder={t('cars.brandPlaceholder')}
						required
						class="w-full bg-white border border-slate-200 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-primary shadow-sm"
					/>
				</div>
				<div class="space-y-1.5">
					<label for="model" class="text-xs font-bold text-slate-500 uppercase ml-1">{t('cars.model')}</label>
					<input
						id="model"
						name="model"
						type="text"
						placeholder={t('cars.modelPlaceholder')}
						required
						class="w-full bg-white border border-slate-200 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-primary shadow-sm"
					/>
				</div>
			</div>

			<div class="space-y-1.5">
				<label for="year" class="text-xs font-bold text-slate-500 uppercase ml-1">{t('cars.year')}</label>
				<input
					id="year"
					name="year"
					type="number"
					placeholder={t('cars.yearPlaceholder')}
					required
					class="w-full bg-white border border-slate-200 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-primary shadow-sm"
				/>
			</div>

			<div class="space-y-1.5">
				<label for="licensePlate" class="text-xs font-bold text-slate-500 uppercase ml-1">{t('cars.licensePlate')}</label>
				<input
					id="licensePlate"
					name="licensePlate"
					type="text"
					placeholder={t('cars.licensePlatePlaceholder')}
					pattern={'[A-Za-z]{3}[- ]?[0-9]{3}'}
					maxlength="7"
					title={t('cars.invalidLicensePlate')}
					class="w-full bg-white border border-slate-200 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-primary shadow-sm uppercase"
				/>
			</div>

			{#if form?.error === 'invalid_license_plate'}
				<div class="text-red-500 text-sm text-center p-2 bg-red-50 rounded-lg">
					{t('cars.invalidLicensePlate')}
				</div>
			{:else if form?.error}
				<div class="text-red-500 text-sm text-center p-2 bg-red-50 rounded-lg">
					{t('cars.saveFailed')}
				</div>
			{/if}

			<button
				type="submit"
				disabled={loading}
				class="w-full bg-dark text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{#if loading}
					{t('cars.saving')}
				{:else}
					{t('cars.finishSetup')}
				{/if}
			</button>
		</form>
	</div>
</div>
