<script lang="ts">
	import { t } from '$lib/i18n';
	import type { FuelLog } from '$lib/types';

	const { logs, limit } = $props<{ logs: FuelLog[]; limit?: number }>();
	
	const displayedLogs = $derived(limit ? logs.slice(0, limit) : logs);
</script>

<div class="space-y-2.5">
	{#each displayedLogs as log}
		<div class="bg-white rounded-xl p-3.5 shadow-sm border border-slate-100 flex items-center justify-between">
			<div class="flex items-center gap-3">
				<div class={`w-9 h-9 rounded-xl flex items-center justify-center text-xs ${
					log.driveType === 'highway' ? 'bg-sky-50 text-sky-500' : log.driveType === 'city' ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'
				}`}>
					<i class={`fas ${log.driveType === 'highway' ? 'fa-road' : log.driveType === 'city' ? 'fa-city' : 'fa-random'}`}></i>
				</div>
				<div>
					<p class="text-xs font-bold text-slate-800">
						Filled {log.distance} {t(`units.${log.distUnit}`)}
					</p>
					<p class="text-[10px] text-slate-400 font-medium">
						Dashboard read: {log.carReported ? `${log.carReported} ${t(`units.${log.carReportedUnit}`)}` : 'N/A'}
					</p>
				</div>
			</div>
			<div class="text-right">
				<p class="text-xs font-extrabold text-slate-800">{(log.distance / log.fuel).toFixed(1)} {t('units.kmPerGal')}</p>
				<p class="text-[10px] text-slate-400 font-medium">${(log.fuel * log.price).toFixed(2)} total</p>
			</div>
		</div>
	{/each}
</div>