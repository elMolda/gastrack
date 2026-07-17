<script lang="ts">
	import { t } from '$lib/i18n';
	import { supabase } from '$lib/db/client';
	import { createCar } from '$lib/db/queries/cars';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let brand = $state('');
	let model = $state('');
	let year = $state('');
	let licensePlate = $state('');
	let isDefault = $state(true);
	let loading = $state(false);
	let error = $state('');
	let checkingAuth = $state(true);

	onMount(async () => {
		// Check authentication when component mounts
		const { data: { user }, error: userError } = await supabase.auth.getUser();
		
		if (userError || !user) {
			// If not authenticated, redirect to login
			goto('/auth/login');
		} else {
			checkingAuth = false;
		}
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		loading = true;
		error = '';

		try {
			// Get current user
			const { data: { user }, error: userError } = await supabase.auth.getUser();
			
			if (userError || !user) {
				error = 'User not authenticated. Please try again.';
				loading = false;
				return;
			}

			await createCar({
				user_id: user.id,
				brand,
				model,
				year: parseInt(year),
				license_plate: licensePlate || null,
				is_default: isDefault
			});

			// Redirect to dashboard
			goto('/');
		} catch (err) {
			error = 'An unexpected error occurred';
			console.error(err);
		} finally {
			loading = false;
		}
	}
</script>

<div class="max-w-md mx-auto bg-slate-50 min-h-screen shadow-xl p-6 flex flex-col justify-center">
	{#if checkingAuth}
		<div class="text-center py-12">
			<div class="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
			<p class="text-slate-600">Checking authentication...</p>
		</div>
	{:else}
		<div class="space-y-6">
			<h1 class="text-2xl font-bold text-dark">Add Your Vehicle</h1>

		<form onsubmit={handleSubmit} class="space-y-4">
			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-1.5">
					<label for="brand" class="text-xs font-bold text-slate-500 uppercase ml-1">Brand</label>
					<input 
						id="brand"
						type="text" 
						placeholder="e.g. VW" 
						bind:value={brand}
						required
						class="w-full bg-white border border-slate-200 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-primary shadow-sm" 
					/>
				</div>
				<div class="space-y-1.5">
					<label for="model" class="text-xs font-bold text-slate-500 uppercase ml-1">Model</label>
					<input 
						id="model"
						type="text" 
						placeholder="e.g. Voyage" 
						bind:value={model}
						required
						class="w-full bg-white border border-slate-200 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-primary shadow-sm" 
					/>
				</div>
			</div>

			<div class="space-y-1.5">
				<label for="year" class="text-xs font-bold text-slate-500 uppercase ml-1">Year</label>
				<input 
					id="year"
					type="number" 
					placeholder="2019" 
					bind:value={year}
					required
					class="w-full bg-white border border-slate-200 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-primary shadow-sm" 
				/>
			</div>

			<div class="space-y-1.5">
				<label for="licensePlate" class="text-xs font-bold text-slate-500 uppercase ml-1">License Plate (Optional)</label>
				<input 
					id="licensePlate"
					type="text" 
					placeholder="ABC-123" 
					bind:value={licensePlate}
					class="w-full bg-white border border-slate-200 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-primary shadow-sm" 
				/>
			</div>

			<div class="space-y-1.5">
				<label for="carPicture" class="text-xs font-bold text-slate-500 uppercase ml-1">Car Picture (Optional)</label>
				<div id="carPicture" class="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 hover:border-primary transition cursor-pointer">
					<i class="fas fa-camera text-2xl mb-2"></i>
					<p class="text-xs">Upload Image</p>
				</div>
			</div>

			<div class="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
				<div>
					<p class="text-sm font-bold text-slate-700">Set as default vehicle</p>
					<p class="text-xs text-slate-500">This car will be selected for new fuel logs</p>
				</div>
				<label class="relative inline-flex items-center cursor-pointer">
					<input type="checkbox" bind:checked={isDefault} class="sr-only peer">
					<div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
				</label>
			</div>

			{#if error}
				<div class="text-red-500 text-sm text-center p-2 bg-red-50 rounded-lg">
					{error}
				</div>
			{/if}

			<button 
				type="submit" 
				disabled={loading}
				class="w-full bg-dark text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{#if loading}
					Saving...
				{:else}
					Finish Setup
				{/if}
			</button>
		</form>
		</div>
	{/if}
</div>
