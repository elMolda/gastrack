<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { t, currentLanguage, setLanguage } from '$lib/i18n';
	import { onMount } from 'svelte';

	let { children } = $props();
	let language = $state<'en' | 'es'>('en');

	onMount(() => {
		// Subscribe to language changes
		const unsubscribe = currentLanguage.subscribe((lang) => {
			language = lang;
		});
		return unsubscribe;
	});

	function toggleLanguage() {
		const newLang = language === 'en' ? 'es' : 'en';
		setLanguage(newLang);
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
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
			title={language === 'en' ? 'Cambiar a Español' : 'Switch to English'}
		>
			<i class={`fas fa-globe ${language === 'en' ? 'text-blue-500' : 'text-green-500'}`}></i>
			<span class="text-sm font-medium text-slate-700">{language === 'en' ? 'ES' : 'EN'}</span>
		</button>
	</div>

	{@render children()}
</div>
