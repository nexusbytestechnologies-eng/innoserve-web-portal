<script lang="ts">
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/auth';
	import { fetchTickets } from '$lib/modules/data/tickets/queries';

	const user = $derived($authStore.user);

	let assignedCount = $state<number | null>(null);
	let inProgressCount = $state<number | null>(null);
	let resolvedCount = $state<number | null>(null);

	onMount(async () => {
		try {
			const all = await fetchTickets();
			const mine = user ? all.filter((t) => t.assignedEngineerId === user.id) : all;
			assignedCount = mine.length;
			inProgressCount = mine.filter((t) => t.status === 'in_progress').length;
			resolvedCount = mine.filter((t) => t.status === 'resolved' || t.status === 'pending_validation' || t.status === 'validated').length;
		} catch {
			assignedCount = 0;
			inProgressCount = 0;
			resolvedCount = 0;
		}
	});

	function display(val: number | null): string {
		return val === null ? '—' : String(val);
	}
</script>

<svelte:head><title>Engineer · Innoserve Techsol</title></svelte:head>

<div class="flex flex-col gap-6">
	<div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
		<h2 class="text-[20px] font-bold text-[#0B182A] mb-1">
			Welcome, {user?.name ?? 'Engineer'} 👋
		</h2>
		<p class="text-[14px] text-gray-500">View and manage your assigned tickets below.</p>
	</div>

	<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
		{#each [
			{ label: 'Assigned to Me', value: display(assignedCount), color: 'text-blue-700' },
			{ label: 'In Progress', value: display(inProgressCount), color: 'text-amber-600' },
			{ label: 'Resolved', value: display(resolvedCount), color: 'text-emerald-700' }
		] as stat}
			<div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
				<p class="text-[13px] text-gray-500 mb-1">{stat.label}</p>
				<p class="text-[28px] font-bold {stat.color}">{stat.value}</p>
			</div>
		{/each}
	</div>
</div>
