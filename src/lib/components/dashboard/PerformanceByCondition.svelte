<script lang="ts">
	import { t } from '$lib/i18n';
	import type { DashboardStats } from '$lib/types';

	const { stats } = $props<{ stats: DashboardStats }>();
</script>

<div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
	<h3 class="text-sm font-bold text-slate-700">{t('dashboard.performanceByCondition')}</h3>
	<div class="space-y-2.5">
		{#each [
			{ id: 'highway', label: t('dashboard.highwayPerformance'), color: 'bg-sky-400', val: stats.driveTypeStats.highway },
			{ id: 'mixed', label: t('dashboard.mixedPerformance'), color: 'bg-emerald-400', val: stats.driveTypeStats.mixed },
			{ id: 'city', label: t('dashboard.cityPerformance'), color: 'bg-amber-400', val: stats.driveTypeStats.city },
		] as item}
			<div class="space-y-1">
				<div class="flex justify-between text-xs font-semibold text-slate-600">
					<span>{item.label}</span>
					<span class="text-slate-900 font-bold">{item.val.toFixed(1)} {t('units.kmPerGal')}</span>
				</div>
				<div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
					<div style="width: {Math.min((item.val / 55) * 100, 100)}%" class="h-full {item.color} rounded-full"></div>
				</div>
			</div>
		{/each}
	</div>
</div>