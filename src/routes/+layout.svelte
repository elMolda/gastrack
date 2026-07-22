<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.png';
	import appleTouchIcon from '$lib/assets/apple-touch-icon.png';
	import { t, currentLanguage, setLanguage } from '$lib/i18n';

	let { children } = $props();

	function toggleLanguage() {
		const next = $currentLanguage === 'en' ? 'es' : 'en';
		setLanguage(next);
	}
</script>

<svelte:head>
	<title>GasTrack</title>
	<meta name="description" content="Fuel tracking and analytics for your vehicles." />
	<link rel="icon" type="image/png" href={favicon} />
	<link rel="apple-touch-icon" href={appleTouchIcon} />
	<!-- Font Awesome -->
	<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
	<!-- Custom styles from prototype -->
	<style>
		body { 
			background-color: #f1f5f9; 
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
		}
		input[type=number]::-webkit-inner-spin-button, 
		input[type=number]::-webkit-outer-spin-button { 
			-webkit-appearance: none; 
			margin: 0; 
		}
		input[type=number] { 
			-moz-appearance: textfield; 
		}
		select { 
			-webkit-appearance: none; 
			appearance: none; 
		}
	</style>
</svelte:head>

<div class="min-h-screen bg-slate-50">
	<!-- Language switcher in top right -->
	<div class="fixed top-4 right-4 z-50">
		<button
			onclick={toggleLanguage}
			class="flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm hover:bg-white transition"
			title={$currentLanguage === 'en' ? t('layout.switchToSpanish') : t('layout.switchToEnglish')}
		>
			<i class={`fas fa-globe ${$currentLanguage === 'en' ? 'text-blue-500' : 'text-green-500'}`}></i>
			<span class="text-sm font-medium text-slate-700">{$currentLanguage === 'en' ? 'ES' : 'EN'}</span>
		</button>
	</div>

	{#key $currentLanguage}
		{@render children()}
	{/key}
</div>
