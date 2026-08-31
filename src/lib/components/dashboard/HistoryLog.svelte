<script lang="ts">
	import { t } from '$lib/i18n';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { FuelLog } from '$lib/types';

	const { logs, limit } = $props<{ logs: FuelLog[]; limit?: number }>();

	const displayedLogs = $derived(limit ? logs.slice(0, limit) : logs);
	let deletingId = $state<string | null>(null);
</script>

<div class="space-y-2.5">
	{#each displayedLogs as log (log.id)}
		<div class="bg-white rounded-xl p-3.5 shadow-sm border border-slate-100 flex items-center justify-between gap-2">
			<div class="flex items-center gap-3 min-w-0">
				<div
					class={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-xs ${
						log.driveType === 'highway'
							? 'bg-sky-50 text-sky-500'
							: log.driveType === 'city'
								? 'bg-amber-50 text-amber-500'
								: 'bg-emerald-50 text-emerald-500'
					}`}
				>
					<i
						class={`fas ${log.driveType === 'highway' ? 'fa-road' : log.driveType === 'city' ? 'fa-city' : 'fa-random'}`}
					></i>
				</div>
				<div class="min-w-0">
					<p class="text-xs font-bold text-slate-800 truncate">
						{t('dashboard.filledDistance', {
							distance: String(log.distance),
							unit: t(`units.${log.distUnit}`)
						})}
					</p>
					<p class="text-[10px] text-slate-400 font-medium truncate">
						{log.date?.slice(0, 10)}
						·
						{t('dashboard.dashboardRead')}
						{log.carReported
							? `${log.carReported} ${t(`units.${log.carReportedUnit}`)}`
							: t('common.notAvailable')}
					</p>
				</div>
			</div>
			<div class="flex items-center gap-1 shrink-0">
				<div class="text-right pr-1">
					<p class="text-xs font-extrabold text-slate-800">
						{(log.distance / log.fuel).toFixed(1)} {t('units.kmPerGal')}
					</p>
					<p class="text-[10px] text-slate-400 font-medium">
						${(log.fuel * log.price).toFixed(2)} {t('common.total')}
					</p>
				</div>
				<a
					href="/logs/{log.id}/edit"
					class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-primary hover:bg-sky-50 transition"
					aria-label={t('common.edit')}
					title={t('common.edit')}
				>
					<i class="fas fa-pen text-xs"></i>
				</a>
				<form
					method="POST"
					action="?/deleteLog"
					use:enhance={() => {
						deletingId = log.id;
						return async ({ result, update }) => {
							await update();
							deletingId = null;
							if (result.type === 'success') {
								await invalidateAll();
							}
						};
					}}
				>
					<input type="hidden" name="logId" value={log.id} />
					<button
						type="submit"
						disabled={deletingId === log.id}
						class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition disabled:opacity-50"
						aria-label={t('common.delete')}
						title={t('common.delete')}
					>
						<i class="fas fa-trash-alt text-xs"></i>
					</button>
				</form>
			</div>
		</div>
	{/each}
</div>
