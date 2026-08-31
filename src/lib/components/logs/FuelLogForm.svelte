<script lang="ts">
	import { t } from '$lib/i18n';
	import { enhance } from '$app/forms';
	import { toKmPerGal } from '$lib/types';
	import type { DistanceUnit, DriveType, EfficiencyUnit, FuelLog, FuelUnit } from '$lib/types';
	import Navbar from '$lib/components/ui/Navbar.svelte';

	const { log, form, title, submitLabel, backHref = '/' } = $props<{
		log?: FuelLog;
		form?: { error?: string } | null;
		title: string;
		submitLabel: string;
		backHref?: string;
	}>();

	const today = new Date().toISOString().split('T')[0];
	let date = $state(log?.date?.slice(0, 10) ?? today);
	let distance = $state(log ? String(log.distance) : '');
	let distUnit = $state<DistanceUnit>(log?.distUnit ?? 'km');
	let fuel = $state(log ? String(log.fuel) : '');
	let fuelUnit = $state<FuelUnit>(log?.fuelUnit ?? 'gal');
	let price = $state(log ? String(log.price) : '');
	let driveType = $state<DriveType>(log?.driveType ?? 'mixed');
	let showAdvanced = $state(Boolean(log?.carReported));
	let carReported = $state(log?.carReported != null ? String(log.carReported) : '');
	let carReportedUnit = $state<EfficiencyUnit>(log?.carReportedUnit ?? 'km/L');
	let loading = $state(false);

	const livePumpEfficiency = $derived(
		distance && fuel && parseFloat(fuel) > 0 ? parseFloat(distance) / parseFloat(fuel) : 0
	);
	const liveCarEfficiencyInKmGal = $derived(
		carReported ? toKmPerGal(parseFloat(carReported), carReportedUnit) : 0
	);
	const liveDeviation = $derived(
		liveCarEfficiencyInKmGal > 0
			? ((livePumpEfficiency - liveCarEfficiencyInKmGal) / liveCarEfficiencyInKmGal) * 100
			: 0
	);
</script>

<div class="max-w-md mx-auto bg-slate-50 min-h-screen shadow-xl relative pb-28">
	<div class="bg-dark text-white px-5 pt-10 pb-6 rounded-b-[2rem] shadow-lg">
		<div class="flex justify-between items-center mb-6">
			<a href={backHref} class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300" aria-label={t('common.goBack')}>
				<i class="fas fa-chevron-left"></i>
			</a>
			<h1 class="text-xl font-semibold tracking-wide text-white">{title}</h1>
			<div class="w-10"></div>
		</div>

		<div class="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/50 flex justify-between items-end backdrop-blur-sm">
			<div>
				<p class="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">{t('logs.efficiencyPreview')}</p>
				<div class="flex items-baseline gap-1">
					<span class="text-3xl font-bold text-white">
						{livePumpEfficiency > 0 ? livePumpEfficiency.toFixed(2) : '0.00'}
					</span>
					<span class="text-sm font-medium text-slate-400">{t(`units.${distUnit}`)}/{t(`units.${fuelUnit}`)}</span>
				</div>
			</div>
			<div class="text-right">
				<p class="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">{t('logs.calculatedCost')}</p>
				<div class="flex items-baseline gap-1 justify-end">
					<span class="text-sm font-medium text-slate-400">$</span>
					<span class="text-2xl font-bold text-white">
						{fuel && price ? (parseFloat(fuel) * parseFloat(price)).toFixed(2) : '0.00'}
					</span>
				</div>
			</div>
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
		class="p-6 space-y-5"
	>
		<input type="hidden" name="driveType" value={driveType} />
		{#if !showAdvanced}
			<input type="hidden" name="carReported" value={carReported} />
			<input type="hidden" name="carReportedUnit" value={carReportedUnit} />
		{/if}

		<div class="space-y-1.5">
			<label for="fillUpDate" class="text-xs font-bold text-slate-500 uppercase ml-1">{t('logs.fillUpDate')}</label>
			<div class="relative">
				<div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
					<i class="far fa-calendar-alt"></i>
				</div>
				<input
					id="fillUpDate"
					name="date"
					type="date"
					bind:value={date}
					class="w-full bg-white border border-slate-200 text-slate-900 rounded-xl p-3.5 pl-12 focus:ring-2 focus:ring-primary outline-none transition shadow-sm font-medium"
				/>
			</div>
		</div>

		<div class="grid grid-cols-2 gap-4">
			<div class="space-y-1.5">
				<label for="distance" class="text-xs font-bold text-slate-500 uppercase ml-1">{t('logs.distanceCovered')}</label>
				<div class="relative flex items-center bg-white border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-primary transition shadow-sm overflow-hidden">
					<input
						id="distance"
						name="distance"
						type="number"
						required
						step="any"
						placeholder="0"
						bind:value={distance}
						class="w-full bg-transparent p-3.5 outline-none font-semibold text-slate-900"
					/>
					<select
						name="distUnit"
						bind:value={distUnit}
						class="bg-slate-50 h-full px-3 text-slate-500 font-bold text-xs outline-none cursor-pointer border-l border-slate-200"
					>
						<option value="km">{t('units.km')}</option>
						<option value="mi">{t('units.mi')}</option>
					</select>
				</div>
			</div>

			<div class="space-y-1.5">
				<label for="fuel" class="text-xs font-bold text-slate-500 uppercase ml-1">{t('logs.fuelAdded')}</label>
				<div class="relative flex items-center bg-white border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-primary transition shadow-sm overflow-hidden">
					<input
						id="fuel"
						name="fuel"
						type="number"
						required
						step="any"
						placeholder="0.0"
						bind:value={fuel}
						class="w-full bg-transparent p-3.5 outline-none font-semibold text-slate-900"
					/>
					<select
						name="fuelUnit"
						bind:value={fuelUnit}
						class="bg-slate-50 h-full px-3 text-slate-500 font-bold text-xs outline-none cursor-pointer border-l border-slate-200"
					>
						<option value="gal">{t('units.gal')}</option>
						<option value="L">{t('units.L')}</option>
					</select>
				</div>
			</div>
		</div>

		<div class="space-y-1.5">
			<label for="price" class="text-xs font-bold text-slate-500 uppercase ml-1">{t('logs.pricePerUnit', { unit: t(`units.${fuelUnit}`) })}</label>
			<div class="relative">
				<div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none font-bold text-slate-400">$</div>
				<input
					id="price"
					name="price"
					type="number"
					required
					step="any"
					placeholder="0.00"
					bind:value={price}
					class="w-full bg-white border border-slate-200 text-slate-900 rounded-xl p-3.5 pl-10 focus:ring-2 focus:ring-primary outline-none transition shadow-sm font-semibold"
				/>
			</div>
		</div>

		<div class="space-y-2">
			<label for="driveConditions" class="text-xs font-bold text-slate-500 uppercase ml-1">{t('logs.driveConditions')}</label>
			<div class="grid grid-cols-3 gap-3">
				{#each [
					{ id: 'city', icon: 'fa-city', label: t('dashboard.city') },
					{ id: 'mixed', icon: 'fa-random', label: t('dashboard.mixed') },
					{ id: 'highway', icon: 'fa-road', label: t('dashboard.highway') }
				] as type}
					<button
						type="button"
						onclick={() => (driveType = type.id as DriveType)}
						class={`py-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition border ${
							driveType === type.id
								? 'bg-primary/10 border-primary text-primary shadow-sm'
								: 'bg-white border-slate-200 text-slate-500'
						}`}
					>
						<i class={`fas ${type.icon}`}></i>
						<span class="text-[11px] font-bold">{type.label}</span>
					</button>
				{/each}
			</div>
		</div>

		<div class="pt-2">
			<button
				type="button"
				onclick={() => (showAdvanced = !showAdvanced)}
				class="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 text-slate-700 font-bold shadow-sm"
			>
				<span class="flex items-center gap-2 text-xs uppercase text-slate-500 tracking-wider">
					<i class="fas fa-car text-slate-400"></i>
					{t('logs.carComputerReadout')}
				</span>
				<i class={`fas fa-chevron-down text-sm transition-transform ${showAdvanced ? 'rotate-180' : ''}`}></i>
			</button>

			{#if showAdvanced}
				<div class="mt-3 p-4 bg-white border border-slate-200 rounded-xl space-y-3">
					<label for="carReported" class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t('logs.dashboardEfficiency')}</label>

					<div class="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-primary transition shadow-sm overflow-hidden">
						<input
							id="carReported"
							name="carReported"
							type="number"
							step="any"
							placeholder={t('logs.efficiencyPlaceholder')}
							bind:value={carReported}
							class="w-full bg-transparent p-3.5 outline-none font-semibold text-slate-900"
						/>
						<select
							name="carReportedUnit"
							bind:value={carReportedUnit}
							class="bg-slate-100 h-full px-3 text-slate-500 font-bold text-xs outline-none cursor-pointer border-l border-slate-200 py-3.5"
						>
							<option value="km/L">{t('units.kmPerL')}</option>
							<option value="km/gal">{t('units.kmPerGal')}</option>
							<option value="MPG">{t('units.mpg')}</option>
							<option value="L/100km">{t('units.lPer100km')}</option>
						</select>
					</div>

					{#if carReported && livePumpEfficiency > 0}
						<div class="text-xs text-slate-500 font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-start gap-2">
							<i class="fas fa-info-circle text-primary mt-0.5"></i>
							<div>
								<p>
									{t('logs.normalizedDashboardRead')}
									<strong class="text-slate-700">{liveCarEfficiencyInKmGal.toFixed(1)} {t('units.kmPerGal')}</strong>
								</p>
								<p class="mt-1">
									{t('logs.pumpComparison', {
										percentage: Math.abs(liveDeviation).toFixed(1),
										comparison: t(liveDeviation >= 0 ? 'logs.better' : 'logs.worse')
									})}
								</p>
							</div>
						</div>
					{/if}
				</div>
			{/if}
		</div>

		{#if form?.error}
			<div class="text-red-500 text-sm text-center p-2 bg-red-50 rounded-lg">{t('common.unexpectedError')}</div>
		{/if}

		<div class="pt-4">
			<button
				type="submit"
				disabled={loading}
				class="w-full bg-primary hover:bg-sky-600 text-white font-bold text-md py-4 rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition disabled:opacity-50"
			>
				{submitLabel}
			</button>
		</div>
	</form>

	<Navbar active="logs" />
</div>
