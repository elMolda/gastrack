<script lang="ts">
	import { t } from '$lib/i18n';
	import type { FuelLog } from '$lib/types';

	const { logs } = $props<{ logs: FuelLog[] }>();
</script>

<div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
	<h3 class="text-sm font-bold text-slate-700 mb-4">{t('dashboard.efficiencyTrend')}</h3>
	<div class="h-28 w-full flex items-end justify-between px-2 pt-2 relative">
		{#each logs.slice(0, 5).reverse() as log, index}
			<div class="flex flex-col items-center flex-1 group">
				<div class="w-7 bg-slate-100 rounded-t-md relative flex items-end h-20 transition-all duration-300 hover:bg-primary/20">
					<div 
						style="height: {Math.min((log.distance / log.fuel / 55) * 100, 100)}%" 
						class={`w-full rounded-t-md transition-all duration-500 ${
							log.driveType === 'highway' ? 'bg-sky-400' : log.driveType === 'city' ? 'bg-amber-400' : 'bg-emerald-400'
						}`}
					></div>
					<span class="absolute -top-6 left-1/2 transform -translate-x-1/2 text-[10px] font-bold text-slate-700 opacity-90">
						{(log.distance / log.fuel).toFixed(0)}
					</span>
				</div>
				<span class="text-[9px] text-slate-400 font-medium mt-1.5">
					{log.date.split('-')[2]}/{log.date.split('-')[1]}
				</span>
			</div>
		{/each}
	</div>
	<div class="flex justify-center gap-4 mt-3 pt-3 border-t border-slate-50 text-[10px] font-semibold text-slate-500">
		<span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-amber-400"></span> {t('dashboard.city')}</span>
		<span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-emerald-400"></span> {t('dashboard.mixed')}</span>
		<span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-sky-400"></span> {t('dashboard.highway')}</span>
	</div>
</div>