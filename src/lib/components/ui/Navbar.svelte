<script lang="ts">
	import { t } from '$lib/i18n';

	const { active = 'dashboard' } = $props<{ active?: 'dashboard' | 'logs' | 'cars' | 'settings' }>();
</script>

<div class="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 backdrop-blur-md border-t border-slate-200/60 px-8 py-3 flex justify-around items-center z-50 rounded-t-3xl shadow-2xl">
	<a
		href="/"
		class={`flex flex-col items-center gap-1 p-2 transition ${active === 'dashboard' ? 'text-primary font-bold' : 'text-slate-400 font-medium'}`}
	>
		<i class="fas fa-chart-pie text-xl"></i>
		<span class="text-[10px]">{t('nav.dashboard')}</span>
	</a>
	
	<a
		href="/logs/new"
		class={`flex flex-col items-center gap-1 p-2 transition ${active === 'logs' ? 'text-primary font-bold' : 'text-slate-400 font-medium'}`}
	>
		<i class="fas fa-gas-pump text-xl"></i>
		<span class="text-[10px]">{t('nav.addLog')}</span>
	</a>

	<a
		href="/cars"
		class={`flex flex-col items-center gap-1 p-2 transition ${active === 'cars' ? 'text-primary font-bold' : 'text-slate-400 font-medium'}`}
	>
		<i class="fas fa-car text-xl"></i>
		<span class="text-[10px]">{t('nav.cars')}</span>
	</a>

	<a
		href="/settings"
		class={`flex flex-col items-center gap-1 p-2 transition ${active === 'settings' ? 'text-primary font-bold' : 'text-slate-400 font-medium'}`}
	>
		<i class="fas fa-cog text-xl"></i>
		<span class="text-[10px]">{t('nav.settings')}</span>
	</a>
</div>