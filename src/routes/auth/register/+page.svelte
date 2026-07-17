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
				error = authError.message;
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

				// Redirect to car setup (mandatory after registration)
				goto('/auth/car-setup');
			}
		} catch (err) {
			error = 'An unexpected error occurred';
			console.error(err);
		} finally {
			loading = false;
		}
	}
</script>

<div class="max-w-md mx-auto bg-slate-50 min-h-screen shadow-xl p-6 flex flex-col justify-center">
	<div class="space-y-6">
		<h1 class="text-2xl font-bold text-dark">Create Account</h1>

		<form on:submit={handleRegister} class="space-y-4">
			<div class="space-y-1.5">
				<label class="text-xs font-bold text-slate-500 uppercase ml-1">Username</label>
				<input 
					type="text" 
					placeholder="Driver123" 
					bind:value={username}
					required
					class="w-full bg-white border border-slate-200 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-primary shadow-sm" 
				/>
			</div>

			<div class="space-y-1.5">
				<label class="text-xs font-bold text-slate-500 uppercase ml-1">Email</label>
				<input 
					type="email" 
					placeholder="name@example.com" 
					bind:value={email}
					required
					class="w-full bg-white border border-slate-200 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-primary shadow-sm" 
				/>
			</div>

			<div class="space-y-1.5">
				<label class="text-xs font-bold text-slate-500 uppercase ml-1">Password</label>
				<input 
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
					Creating account...
				{:else}
					Continue
				{/if}
			</button>
		</form>

		<p class="text-center text-xs text-slate-500">
			Already have an account? 
			<a href="/auth/login" class="text-primary font-bold ml-1">Sign In</a>
		</p>
	</div>
</div>