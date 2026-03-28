<script lang="ts">
	import { authStore } from '$lib/stores/auth';
	const user = $derived($authStore.user);
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
			{ label: 'Assigned to Me', value: '—', color: 'text-blue-700' },
			{ label: 'In Progress', value: '—', color: 'text-amber-600' },
			{ label: 'Resolved Today', value: '—', color: 'text-emerald-700' }
		] as stat}
			<div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
				<p class="text-[13px] text-gray-500 mb-1">{stat.label}</p>
				<p class="text-[28px] font-bold {stat.color}">{stat.value}</p>
			</div>
		{/each}
	</div>
</div>
