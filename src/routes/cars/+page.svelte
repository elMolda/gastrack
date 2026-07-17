<script lang="ts">
	import { t } from '$lib/i18n';
	import { supabase } from '$lib/db/client';
	import { deleteCar, updateCar } from '$lib/db/queries/cars';
	import { goto, invalidateAll } from '$app/navigation';
	import Navbar from '$lib/components/ui/Navbar.svelte';
	import type { Database } from '$lib/db/schema';

	type DbCar = Database['public']['Tables']['cars']['Row'];

	const { data } = $props<{ data: { cars: DbCar[] } }>();

	let cars = $state([...data.cars]);
	let openMenuId = $state<string | null>(null);
	let carToDelete = $state<DbCar | null>(null);
	let deleting = $state(false);
	let errorMessage = $state('');

	function toggleMenu(carId: string) {
		openMenuId = openMenuId === carId ? null : carId;
	}

	function closeMenu() {
		openMenuId = null;
	}

	function confirmDelete(car: DbCar) {
		carToDelete = car;
		closeMenu();
	}

	function cancelDelete() {
		carToDelete = null;
	}

	async function handleDelete() {
		if (!carToDelete) return;

		deleting = true;
		errorMessage = '';

		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) {
				goto('/auth/login');
				return;
			}

			const remaining = cars.filter((c) => c.id !== carToDelete!.id);

			if (carToDelete.is_default && remaining.length > 0) {
				await updateCar(remaining[0].id, { is_default: true });
			}

			await deleteCar(carToDelete.id);

			if (remaining.length === 0) {
				goto('/auth/car-setup');
				return;
			}

			cars = remaining;
			carToDelete = null;
			await invalidateAll();
		} catch (err) {
			console.error('Error deleting car:', err);
			errorMessage = t('cars.deleteFailed');
		} finally {
			deleting = false;
		}
	}
</script>

<svelte:window onclick={closeMenu} />

<div class="max-w-md mx-auto bg-slate-50 min-h-screen shadow-xl relative pb-28">
	<div class="bg-dark text-white px-5 pt-10 pb-6 rounded-b-[2rem] shadow-lg">
		<div class="flex justify-between items-center mb-6">
			<a href="/" class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300" aria-label={t('common.goBack')}>
				<i class="fas fa-chevron-left"></i>
			</a>
			<h1 class="text-xl font-semibold tracking-wide text-white">{t('cars.manageCars')}</h1>
			<a href="/cars/new" class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white hover:text-primary transition" aria-label={t('cars.addCar')}>
				<i class="fas fa-plus"></i>
			</a>
		</div>
	</div>

	<div class="p-6 space-y-6">
		<a href="/cars/new" class="block w-full bg-primary hover:bg-sky-600 text-white font-bold text-md py-4 rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition text-center">
			<i class="fas fa-plus mr-2"></i>
			{t('cars.addCar')}
		</a>

		{#if errorMessage}
			<div class="text-red-500 text-sm text-center p-2 bg-red-50 rounded-lg">{errorMessage}</div>
		{/if}

		{#if cars.length === 0}
			<div class="text-center py-12">
				<div class="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
					<i class="fas fa-car text-slate-400 text-2xl"></i>
				</div>
				<h3 class="text-lg font-bold text-slate-700 mb-2">{t('cars.noVehicles')}</h3>
				<p class="text-slate-500 text-sm">{t('cars.noVehiclesDescription')}</p>
			</div>
		{:else}
			<div class="space-y-4">
				{#each cars as car (car.id)}
					<div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
						<div class="flex items-start justify-between">
							<div class="flex items-start gap-3">
								<div class="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
									<i class="fas fa-car text-slate-400 text-xl"></i>
								</div>
								<div>
									<h3 class="font-bold text-slate-800">{car.brand} {car.model}</h3>
									<p class="text-sm text-slate-500">{car.year} • {car.license_plate || t('cars.noPlate')}</p>
									{#if car.is_default}
										<span class="inline-block mt-1 text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
											{t('cars.defaultVehicle')}
										</span>
									{/if}
								</div>
							</div>
							<div class="relative">
								<button
									onclick={(e) => { e.stopPropagation(); toggleMenu(car.id); }}
									class="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
									aria-label={t('common.moreOptions')}
									aria-expanded={openMenuId === car.id}
								>
									<i class="fas fa-ellipsis-v"></i>
								</button>

								{#if openMenuId === car.id}
									<div class="absolute right-0 top-10 z-20 w-40 bg-white rounded-xl shadow-lg border border-slate-100 py-1 overflow-hidden">
										<a
											href="/cars/{car.id}/edit"
											class="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
										>
											<i class="fas fa-pen text-slate-400 w-4"></i>
											{t('common.edit')}
										</a>
										<button
											onclick={() => confirmDelete(car)}
											class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
										>
											<i class="fas fa-trash-alt w-4"></i>
											{t('common.delete')}
										</button>
									</div>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<Navbar active="cars" />
</div>

{#if carToDelete}
	<div class="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/40">
		<div class="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
			<h3 class="text-lg font-bold text-slate-800 mb-2">{t('cars.deleteCar')}</h3>
			<p class="text-sm text-slate-600 mb-2">
				{t('cars.deleteConfirm', { brand: carToDelete.brand, model: carToDelete.model })}
			</p>
			{#if cars.length === 1}
				<p class="text-sm text-amber-600 mb-4">{t('cars.deleteLastCarWarning')}</p>
			{:else}
				<div class="mb-4"></div>
			{/if}
			<div class="flex gap-3">
				<button
					onclick={cancelDelete}
					disabled={deleting}
					class="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition disabled:opacity-50"
				>
					{t('common.cancel')}
				</button>
				<button
					onclick={handleDelete}
					disabled={deleting}
					class="flex-1 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:opacity-50"
				>
					{deleting ? t('cars.deleting') : t('common.delete')}
				</button>
			</div>
		</div>
	</div>
{/if}
