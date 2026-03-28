<script lang="ts">
	import { authStore } from '$lib/stores/auth';
	const user = $derived($authStore.user);
</script>

<svelte:head><title>NOC · Innoserve Techsol</title></svelte:head>

<div class="flex flex-col gap-6">
	<div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
		<h2 class="text-[20px] font-bold text-[#0B182A] mb-1">
			NOC Console — {user?.name ?? 'Operator'} 👋
		</h2>
		<p class="text-[14px] text-gray-500">Monitor network operations and escalations.</p>
	</div>

	<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
		{#each [
			{ label: 'Active Alerts', value: '—', color: 'text-red-600' },
			{ label: 'Monitoring', value: '—', color: 'text-purple-700' },
			{ label: 'Resolved Today', value: '—', color: 'text-emerald-700' }
		] as stat}
			<div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
				<p class="text-[13px] text-gray-500 mb-1">{stat.label}</p>
				<p class="text-[28px] font-bold {stat.color}">{stat.value}</p>
			</div>
		{/each}
	</div>
</div>
