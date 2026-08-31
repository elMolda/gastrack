<script lang="ts">
	import { t } from '$lib/i18n';
	import FuelLogForm from '$lib/components/logs/FuelLogForm.svelte';

	let { form } = $props();
</script>

<FuelLogForm {form} title={t('logs.newFillUp')} submitLabel={t('logs.saveLogEntry')} />
