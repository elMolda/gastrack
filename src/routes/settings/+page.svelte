<script lang="ts">
	import { t, currentLanguage, setLanguage } from '$lib/i18n';
	import { supabase } from '$lib/db/client';
	import { resetUserData } from '$lib/db/queries/cars';
	import { goto } from '$app/navigation';
	import Navbar from '$lib/components/ui/Navbar.svelte';

	let selectedLanguage = $state<'en' | 'es'>('en');
	let currentLang = $state<'en' | 'es'>('en');
	let showSaveButton = $state(false);
	let userEmail = $state('');
	let showResetConfirm = $state(false);
	let resetting = $state(false);
	let resetError = $state('');

	// Initialize with current language
	currentLanguage.subscribe((lang) => {
		currentLang = lang;
		selectedLanguage = lang;
	})();

	// Get current user
	supabase.auth.getUser().then(({ data: { user } }) => {
		if (user) {
			userEmail = user.email || '';
		}
	});

	// Handle language selection
	function selectLanguage(lang: 'en' | 'es') {
		selectedLanguage = lang;
		showSaveButton = lang !== currentLang;
	}

	// Save language change
	function saveLanguage() {
		setLanguage(selectedLanguage);
		showSaveButton = false;
		currentLang = selectedLanguage;
	}

	// Handle logout
	async function handleLogout() {
		await supabase.auth.signOut();
		goto('/auth/login');
	}

	async function handleResetData() {
		resetting = true;
		resetError = '';

		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) {
				goto('/auth/login');
				return;
			}

			await resetUserData(user.id);
			showResetConfirm = false;
			goto('/auth/car-setup');
		} catch (err) {
			console.error('Error resetting data:', err);
			resetError = t('settings.resetFailed');
		} finally {
			resetting = false;
		}
	}
</script>

<div class="max-w-md mx-auto bg-slate-50 min-h-screen shadow-xl relative pb-28">
	<!-- Header -->
	<div class="bg-dark text-white px-5 pt-10 pb-6 rounded-b-[2rem] shadow-lg">
		<div class="flex justify-between items-center mb-6">
			<a href="/" class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300" aria-label={t('common.goBack')}>
				<i class="fas fa-chevron-left"></i>
			</a>
			<h1 class="text-xl font-semibold tracking-wide text-white">{t('nav.settings')}</h1>
			<div class="w-10"></div> <!-- Spacer for alignment -->
		</div>
	</div>

	<!-- Settings Content -->
	<div class="p-6 space-y-6">
		<!-- User Profile -->
		<div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
			<h3 class="text-sm font-bold text-slate-700 mb-4">{t('settings.account')}</h3>
			<div class="space-y-3">
				<div class="flex items-center gap-3 p-3">
					<div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
						<i class="fas fa-user text-primary"></i>
					</div>
					<div class="flex-1">
						<p class="font-semibold text-slate-800">{userEmail || t('settings.loading')}</p>
						<p class="text-xs text-slate-500">{t('settings.signedIn')}</p>
					</div>
				</div>
				<button
					onclick={handleLogout}
					class="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition"
				>
					<i class="fas fa-sign-out-alt"></i>
					<span class="font-semibold">{t('settings.logout')}</span>
				</button>
			</div>
		</div>

		<!-- Language Settings -->
		<div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
			<h3 class="text-sm font-bold text-slate-700 mb-4">{t('settings.language')}</h3>
			<div class="space-y-3">
				<button
					onclick={() => selectLanguage('en')}
					class={`w-full flex items-center justify-between p-3 rounded-xl border transition ${
						selectedLanguage === 'en' ? 'bg-primary/30 border-primary text-primary' : 'bg-white border-slate-200 text-slate-700'
					}`}
					aria-label={t('settings.selectEnglish')}
				>
					<div class="flex items-center gap-3">
						<div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
							<span class="text-sm font-bold">EN</span>
						</div>
						<div class="text-left">
							<p class="font-semibold">{t('settings.english')}</p>
							<p class="text-xs text-slate-500">{t('settings.englishDescription')}</p>
						</div>
					</div>
					{#if selectedLanguage === 'en'}
						<i class="fas fa-check text-primary"></i>
					{/if}
				</button>

				<button
					onclick={() => selectLanguage('es')}
					class={`w-full flex items-center justify-between p-3 rounded-xl border transition ${
						selectedLanguage === 'es' ? 'bg-primary/30 border-primary text-primary' : 'bg-white border-slate-200 text-slate-700'
					}`}
					aria-label={t('settings.selectSpanish')}
				>
					<div class="flex items-center gap-3">
						<div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
							<span class="text-sm font-bold">ES</span>
						</div>
						<div class="text-left">
							<p class="font-semibold">{t('settings.spanish')}</p>
							<p class="text-xs text-slate-500">{t('settings.spanishDescription')}</p>
						</div>
					</div>
					{#if selectedLanguage === 'es'}
						<i class="fas fa-check text-primary"></i>
					{/if}
				</button>

				{#if showSaveButton}
					<button
						onclick={saveLanguage}
						class="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary/90 transition mt-4"
					>
						{t('settings.saveLanguage')}
					</button>
				{/if}
			</div>
		</div>

		<!-- App Info -->
		<div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
			<h3 class="text-sm font-bold text-slate-700 mb-4">{t('settings.appInfo')}</h3>
			<div class="space-y-3">
				<div class="flex justify-between items-center py-2">
					<span class="text-sm text-slate-600">{t('settings.version')}</span>
					<span class="text-sm font-semibold text-slate-800">1.0.0</span>
				</div>
				<div class="flex justify-between items-center py-2">
					<span class="text-sm text-slate-600">{t('settings.buildDate')}</span>
					<span class="text-sm font-semibold text-slate-800">{t('settings.buildDateValue')}</span>
				</div>
				<div class="flex justify-between items-center py-2">
					<span class="text-sm text-slate-600">{t('settings.developer')}</span>
					<span class="text-sm font-semibold text-slate-800">ElMolda Software</span>
				</div>
			</div>
		</div>

		<!-- Support -->
		<div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
			<h3 class="text-sm font-bold text-slate-700 mb-4">{t('settings.supportFeedback')}</h3>
			<div class="space-y-3">
				<a href="mailto:support@gastrack.com" class="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-primary transition">
					<div class="flex items-center gap-3">
						<div class="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
							<i class="fas fa-question-circle text-amber-500"></i>
						</div>
						<div>
							<p class="font-semibold text-slate-700">{t('settings.helpSupport')}</p>
							<p class="text-xs text-slate-500">{t('settings.helpSupportDescription')}</p>
						</div>
					</div>
					<i class="fas fa-chevron-right text-slate-400"></i>
				</a>

				<a href="mailto:feedback@gastrack.com" class="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-primary transition">
					<div class="flex items-center gap-3">
						<div class="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
							<i class="fas fa-comment-dots text-emerald-500"></i>
						</div>
						<div>
							<p class="font-semibold text-slate-700">{t('settings.sendFeedback')}</p>
							<p class="text-xs text-slate-500">{t('settings.sendFeedbackDescription')}</p>
						</div>
					</div>
					<i class="fas fa-chevron-right text-slate-400"></i>
				</a>
			</div>
		</div>

		<!-- Reset Data (Danger Zone) -->
		<div class="bg-white rounded-2xl p-4 shadow-sm border border-red-100">
			<h3 class="text-sm font-bold text-red-700 mb-4">{t('settings.dangerZone')}</h3>
			{#if resetError}
				<div class="text-red-500 text-sm text-center p-2 bg-red-50 rounded-lg mb-3">{resetError}</div>
			{/if}
			<button
				onclick={() => showResetConfirm = true}
				class="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition"
			>
				<i class="fas fa-trash-alt"></i>
				<span class="font-semibold">{t('settings.resetAllData')}</span>
			</button>
			<p class="text-xs text-red-500 mt-2">{t('settings.resetWarning')}</p>
		</div>
	</div>

	<!-- Navigation Bar -->
	<Navbar active="settings" />
</div>

{#if showResetConfirm}
	<div class="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/40">
		<div class="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
			<h3 class="text-lg font-bold text-slate-800 mb-2">{t('settings.resetAllData')}</h3>
			<p class="text-sm text-slate-600 mb-6">{t('settings.resetConfirm')}</p>
			<div class="flex gap-3">
				<button
					onclick={() => showResetConfirm = false}
					disabled={resetting}
					class="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition disabled:opacity-50"
				>
					{t('common.cancel')}
				</button>
				<button
					onclick={handleResetData}
					disabled={resetting}
					class="flex-1 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:opacity-50"
				>
					{resetting ? t('settings.resetting') : t('common.delete')}
				</button>
			</div>
		</div>
	</div>
{/if}