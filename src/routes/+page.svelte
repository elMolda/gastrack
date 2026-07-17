<script lang="ts">
	import { t } from '$lib/i18n';
	import type { FuelLog, DashboardStats } from '$lib/types';
	import { supabase } from '$lib/db/client';
	import EfficiencyChart from '$lib/components/dashboard/EfficiencyChart.svelte';
	import PerformanceByCondition from '$lib/components/dashboard/PerformanceByCondition.svelte';
	import HistoryLog from '$lib/components/dashboard/HistoryLog.svelte';
	import Navbar from '$lib/components/ui/Navbar.svelte';

	const { data } = $props<{
		data: {
			logs: FuelLog[];
			stats: DashboardStats;
			cars: any[];
		};
	}>();

	// Real-time subscription for fuel log updates
	let realTimeLogs = $state(data.logs);
	let realTimeStats = $state(data.stats);

	// Subscribe to fuel_logs table changes
	supabase
		.channel('fuel-logs-changes')
		.on(
			'postgres_changes',
			{
				event: 'INSERT',
				schema: 'public',
				table: 'fuel_logs'
			},
			async (payload) => {
				// When a new log is inserted, refresh the data
				const { data: { user } } = await supabase.auth.getUser();
				if (user && payload.new.user_id === user.id) {
					// In a real app, you would fetch the updated data
					// For now, we'll just reload the page to get fresh data
					window.location.reload();
				}
			}
		)
		.on(
			'postgres_changes',
			{
				event: 'DELETE',
				schema: 'public',
				table: 'fuel_logs'
			},
			async (payload) => {
				const { data: { user } } = await supabase.auth.getUser();
				if (user && payload.old.user_id === user.id) {
					window.location.reload();
				}
			}
		)
		.subscribe();

	// Cleanup subscription on component destroy
	$effect(() => {
		return () => {
			supabase.channel('fuel-logs-changes').unsubscribe();
		};
	});
</script>

<div class="max-w-md mx-auto bg-slate-50 min-h-screen shadow-xl relative pb-28">
	<!-- Dashboard Header -->
	<div class="bg-dark text-white px-5 pt-10 pb-20 rounded-b-[2.5rem] shadow-lg">
		<div class="flex justify-between items-center mb-6">
			<div>
				<p class="text-slate-400 text-xs font-semibold uppercase tracking-wider">{t('dashboard.welcome')}</p>
				<h1 class="text-2xl font-bold tracking-tight text-white">{t('dashboard.title')}</h1>
			</div>
			<div class="w-10"></div> <!-- Spacer for alignment -->
		</div>

		<div class="grid grid-cols-2 gap-4 mt-4">
			<div class="bg-slate-800/90 rounded-2xl p-4 border border-slate-700/40 backdrop-blur-sm">
				<p class="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">{t('dashboard.avgEfficiency')}</p>
				<div class="flex items-baseline gap-1">
					<span class="text-3xl font-extrabold text-primary">{data.stats.avgEfficiency.toFixed(1)}</span>
					<span class="text-xs font-medium text-slate-400">{t('units.kmPerGal')}</span>
				</div>
			</div>
			<div class="bg-slate-800/90 rounded-2xl p-4 border border-slate-700/40 backdrop-blur-sm">
				<p class="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">{t('dashboard.costPerKm')}</p>
				<div class="flex items-baseline gap-0.5">
					<span class="text-xs font-semibold text-slate-400">$</span>
					<span class="text-3xl font-extrabold text-white">{data.stats.avgCostPerKm.toFixed(2)}</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Dashboard Content -->
	<div class="px-5 -mt-12 space-y-5">
		<!-- Quick Stats -->
		<div class="grid grid-cols-3 gap-3">
			<div class="bg-white rounded-xl p-3 shadow-sm border border-slate-100 text-center">
				<p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t('dashboard.totalSpent')}</p>
				<p class="text-sm font-bold text-slate-800 mt-1">${data.stats.totalSpent.toLocaleString('en-US', {maximumFractionDigits:0})}</p>
			</div>
			<div class="bg-white rounded-xl p-3 shadow-sm border border-slate-100 text-center">
				<p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t('dashboard.distance')}</p>
				<p class="text-sm font-bold text-slate-800 mt-1">{data.stats.totalKm} {t('units.km')}</p>
			</div>
			<div class="bg-white rounded-xl p-3 shadow-sm border border-slate-100 text-center">
				<p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t('dashboard.totalFuel')}</p>
				<p class="text-sm font-bold text-slate-800 mt-1">{data.stats.totalGal.toFixed(1)} {t('units.gal')}</p>
			</div>
		</div>

		<!-- Efficiency Chart -->
		<EfficiencyChart logs={data.logs} />

		<!-- Performance by Condition -->
		<PerformanceByCondition stats={data.stats} />

		<!-- Computer Accuracy Analysis -->
		<div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
			<div class="space-y-0.5 max-w-[65%]">
				<h3 class="text-sm font-bold text-slate-700">{t('dashboard.onboardComputerAccuracy')}</h3>
				<p class="text-xs text-slate-400 font-medium">{t('dashboard.computerAccuracyDescription')}</p>
			</div>
			<div class="text-right">
				<span class={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${
					data.stats.calculationDeviation < 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
				}`}>
					{data.stats.calculationDeviation.toFixed(1)}% {data.stats.calculationDeviation < 0 ? t('dashboard.optimistic') : t('dashboard.pessimistic')}
				</span>
			</div>
		</div>

		<!-- History Log -->
		<div class="space-y-3">
			<div class="flex justify-between items-center px-1">
				<h3 class="text-sm font-bold text-slate-700">{t('dashboard.historyLog')}</h3>
				<a href="/logs" class="text-xs font-semibold text-primary">{t('dashboard.viewAll')}</a>
			</div>
			
			<HistoryLog logs={data.logs} limit={5} />
		</div>
	</div>

	<!-- Navigation Bar -->
	<Navbar active="dashboard" />
</div>
