<script lang="ts">
	import { t } from '$lib/i18n';
	import type { FuelLog } from '$lib/types';
	import HistoryLog from '$lib/components/dashboard/HistoryLog.svelte';
	import Navbar from '$lib/components/ui/Navbar.svelte';

	const { data } = $props<{ data: { logs: FuelLog[] } }>();
</script>

<div class="max-w-md mx-auto bg-slate-50 min-h-screen shadow-xl relative pb-28">
	<div class="bg-dark text-white px-5 pt-10 pb-6 rounded-b-[2rem] shadow-lg">
		<div class="flex justify-between items-center mb-2">
			<a href="/" class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300" aria-label={t('common.goBack')}>
				<i class="fas fa-chevron-left"></i>
			</a>
			<h1 class="text-xl font-semibold tracking-wide text-white">{t('logs.allLogs')}</h1>
			<div class="w-10"></div>
		</div>
		<p class="text-center text-xs text-slate-400 font-medium">
			{t('dashboard.historyLog')}
		</p>
	</div>

	<div class="p-5 space-y-4">
		{#if data.logs.length === 0}
			<div class="text-center py-12">
				<div class="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
					<i class="fas fa-gas-pump text-slate-400 text-2xl"></i>
				</div>
				<h3 class="text-lg font-bold text-slate-700 mb-2">{t('logs.noLogs')}</h3>
				<p class="text-slate-500 text-sm mb-6">{t('logs.noLogsDescription')}</p>
				<a
					href="/logs/new"
					class="inline-block bg-primary text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-primary/20"
				>
					{t('logs.newFillUp')}
				</a>
			</div>
		{:else}
			<HistoryLog logs={data.logs} />
		{/if}
	</div>

	<Navbar active="dashboard" />
</div>
