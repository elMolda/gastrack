<script lang="ts">
	import { t } from '$lib/i18n';
	import { supabase } from '$lib/db/client';
	import { goto } from '$app/navigation';

	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let error = $state('');

	async function handleLogin(e: Event) {
		e.preventDefault();
		loading = true;
		error = '';

		try {
			const { data, error: authError } = await supabase.auth.signInWithPassword({
				email,
				password
			});

			if (authError) {
				error = authError.message;
				return;
			}

			if (data.user) {
				// Wait a moment for session to be established
				await new Promise(resolve => setTimeout(resolve, 500));

				// Check if user has any cars
				const { data: cars, error: carsError } = await supabase
					.from('cars')
					.select('id')
					.eq('user_id', data.user.id)
					.limit(1);

				if (carsError) {
					console.error('Error checking cars:', carsError);
				}

				// If no cars, redirect to car setup
				if (!cars || cars.length === 0) {
					goto('/auth/car-setup');
				} else {
					goto('/');
				}
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
		<div class="text-center mb-8">
			<h1 class="text-3xl font-bold text-dark">Welcome Back</h1>
			<p class="text-slate-400 text-sm">Sign in to your fuel analytics</p>
		</div>

		<form onsubmit={handleLogin} class="space-y-4">
			<div class="space-y-1.5">
				<label for="email" class="text-xs font-bold text-slate-500 uppercase ml-1">Email</label>
				<input 
					id="email"
					type="email" 
					placeholder="name@example.com" 
					bind:value={email}
					required
					class="w-full bg-white border border-slate-200 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-primary shadow-sm" 
				/>
			</div>

			<div class="space-y-1.5">
				<label for="password" class="text-xs font-bold text-slate-500 uppercase ml-1">Password</label>
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
					Signing in...
				{:else}
					Sign In
				{/if}
			</button>
		</form>

		<p class="text-center text-xs text-slate-500">
			Don't have an account? 
			<a href="/auth/register" class="text-primary font-bold ml-1">Register</a>
		</p>
	</div>
</div>