<script lang="ts">
	import { t } from '$lib/i18n';
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';

	let username = $state('');
	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let error = $state('');

	async function handleRegister(e: Event) {
		e.preventDefault();
		loading = true;
		error = '';

		try {
			const { error: authError } = await authClient.signUp.email({
				email,
				password,
				name: username
			});

			if (authError) {
				error = t('auth.registrationFailed');
				return;
			}

			// Domain `users` row is upserted via Better Auth databaseHooks.
			goto('/auth/car-setup');
		} catch (err) {
			error = t('common.unexpectedError');
			console.error(err);
		} finally {
			loading = false;
		}
	}

	async function handleGoogle() {
		loading = true;
		error = '';
		try {
			await authClient.signIn.social({
				provider: 'google',
				callbackURL: '/'
			});
		} catch (err) {
			error = t('common.unexpectedError');
			console.error(err);
			loading = false;
		}
	}
</script>

<div class="max-w-md mx-auto bg-slate-50 min-h-screen shadow-xl p-6 flex flex-col justify-center">
	<div class="space-y-6">
		<h1 class="text-2xl font-bold text-dark">{t('auth.createAccount')}</h1>

		<form onsubmit={handleRegister} class="space-y-4">
			<div class="space-y-1.5">
				<label for="username" class="text-xs font-bold text-slate-500 uppercase ml-1">{t('auth.username')}</label>
				<input
					id="username"
					type="text"
					placeholder={t('auth.usernamePlaceholder')}
					bind:value={username}
					required
					class="w-full bg-white border border-slate-200 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-primary shadow-sm"
				/>
			</div>

			<div class="space-y-1.5">
				<label for="email" class="text-xs font-bold text-slate-500 uppercase ml-1">{t('auth.email')}</label>
				<input
					id="email"
					type="email"
					placeholder={t('auth.emailPlaceholder')}
					bind:value={email}
					required
					class="w-full bg-white border border-slate-200 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-primary shadow-sm"
				/>
			</div>

			<div class="space-y-1.5">
				<label for="password" class="text-xs font-bold text-slate-500 uppercase ml-1">{t('auth.password')}</label>
				<input
					id="password"
					type="password"
					placeholder="••••••••"
					bind:value={password}
					required
					class="w-full bg-white border border-slate-200 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-primary shadow-sm"
				/>
			</div>

			{#if error}
				<div class="text-red-500 text-sm text-center p-2 bg-red-50 rounded-lg">
					{error}
				</div>
			{/if}

			<button
				type="submit"
				disabled={loading}
				class="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-sky-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{#if loading}
					{t('auth.creatingAccount')}
				{:else}
					{t('auth.continue')}
				{/if}
			</button>
		</form>

		<div class="relative flex items-center gap-3">
			<div class="flex-1 h-px bg-slate-200"></div>
			<span class="text-xs font-bold text-slate-400 uppercase">{t('auth.or')}</span>
			<div class="flex-1 h-px bg-slate-200"></div>
		</div>

		<button
			type="button"
			onclick={handleGoogle}
			disabled={loading}
			class="w-full bg-white border border-slate-200 text-slate-700 py-3.5 rounded-xl font-bold hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
		>
			<svg class="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
				<path fill="#EA4335" d="M12 10.2v3.6h5.1c-.2 1.2-.9 2.2-1.9 2.9l3.1 2.4c1.8-1.7 2.8-4.1 2.8-7 0-.7-.1-1.3-.2-1.9H12z"/>
				<path fill="#34A853" d="M6.6 14.3l-.7.5-2.4 1.9C5.2 19.3 8.4 21 12 21c2.7 0 4.9-.9 6.5-2.4l-3.1-2.4c-.9.6-2 .9-3.4.9-2.6 0-4.8-1.7-5.6-4.1z"/>
				<path fill="#4A90E2" d="M3.5 6.3C2.5 8.1 2 10 2 12s.5 3.9 1.5 5.7l3.1-2.4C6.2 14.5 6 13.3 6 12s.2-2.5.6-3.3L3.5 6.3z"/>
				<path fill="#FBBC05" d="M12 6c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 3.1 14.7 2 12 2 8.4 2 5.2 3.7 3.5 6.3l3.1 2.4C7.2 7.7 9.4 6 12 6z"/>
			</svg>
			{t('auth.continueWithGoogle')}
		</button>

		<p class="text-center text-xs text-slate-500">
			{t('auth.hasAccount')}
			<a href="/auth/login" class="text-primary font-bold ml-1">{t('auth.signIn')}</a>
		</p>
	</div>
</div>
