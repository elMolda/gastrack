<script lang="ts">
	import { t } from '$lib/i18n';
	import FuelLogForm from '$lib/components/logs/FuelLogForm.svelte';
	import type { FuelLog } from '$lib/types';

	const { data, form } = $props<{ data: { log: FuelLog }; form?: { error?: string } | null }>();
</script>

<FuelLogForm
	log={data.log}
	{form}
	title={t('logs.editFillUp')}
	submitLabel={t('logs.saveLogEntry')}
	backHref="/logs"
/>
