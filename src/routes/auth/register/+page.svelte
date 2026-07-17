<script lang="ts">
	import { t } from '$lib/i18n';
	import { supabase } from '$lib/db/client';
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
			// Register user with Supabase Auth
			const { data, error: authError } = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: {
						username
					}
				}
			});

			if (authError) {
				error = t('auth.registrationFailed');
				return;
			}

			if (data.user) {
				// Create user profile in public.users table
				const { error: profileError } = await supabase
					.from('users')
					.insert({
						id: data.user.id,
						email: data.user.email!,
						username: username || null
					});

				if (profileError) {
					console.error('Error creating user profile:', profileError);
				}

				// Wait a moment for session to be established
				await new Promise(resolve => setTimeout(resolve, 500));
				
				// Redirect to car setup (mandatory after registration)
				goto('/auth/car-setup');
			}
		} catch (err) {
			error = t('common.unexpectedError');
			console.error(err);
		} finally {
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

		<p class="text-center text-xs text-slate-500">
			{t('auth.hasAccount')}
			<a href="/auth/login" class="text-primary font-bold ml-1">{t('auth.signIn')}</a>
		</p>
	</div>
</div>