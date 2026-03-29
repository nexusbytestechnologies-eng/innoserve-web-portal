<script lang="ts">
  import { onMount } from 'svelte';
  import * as Icons from '$lib/icons';
  import { toast } from 'svelte-sonner';
  import {
    fetchReplacements,
    approveReplacement,
    dispatchReplacement,
    rejectReplacement,
    type ReplacementRequest,
  } from '$lib/api/replacements';

  // ── State ─────────────────────────────────────────────────────────────────

  let replacements = $state<ReplacementRequest[]>([]);
  let loading = $state(true);
  let filterStatus = $state('');

  // Approve modal
  let approveTarget = $state<ReplacementRequest | null>(null);
  let poNumber = $state('');
  let poError = $state('');
  let approving = $state(false);

  // Acting on a row (dispatch / reject)
  let actingId = $state<string | null>(null);

  // ── Load ──────────────────────────────────────────────────────────────────

  onMount(async () => {
    await loadReplacements();
  });

  async function loadReplacements() {
    loading = true;
    try {
      replacements = await fetchReplacements(filterStatus || undefined);
    } catch (err) {
      toast.error(`Failed to load replacements: ${(err as Error).message}`);
    } finally {
      loading = false;
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  function fmtDate(d: string) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function statusBadge(s: string) {
    const map: Record<string, string> = {
      pending:    'bg-amber-50 text-amber-700',
      approved:   'bg-blue-50 text-blue-700',
      dispatched: 'bg-indigo-50 text-indigo-700',
      replaced:   'bg-green-50 text-green-700',
      rejected:   'bg-red-50 text-red-600',
    };
    return map[s] ?? 'bg-gray-100 text-gray-500';
  }

  function statusLabel(s: string) {
    const map: Record<string, string> = {
      pending:    'Pending',
      approved:   'Approved',
      dispatched: 'Dispatched',
      replaced:   'Replaced',
      rejected:   'Rejected',
    };
    return map[s] ?? s;
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  function openApprove(r: ReplacementRequest) {
    approveTarget = r;
    poNumber = '';
    poError = '';
  }

  async function submitApprove() {
    if (!approveTarget) return;
    if (!poNumber.trim()) {
      poError = 'PO Number is required';
      return;
    }
    poError = '';
    approving = true;
    try {
      const updated = await approveReplacement(approveTarget.id, poNumber.trim());
      replacements = replacements.map((r) => (r.id === updated.id ? updated : r));
      toast.success('Replacement approved');
      approveTarget = null;
    } catch (err) {
      toast.error(`Failed: ${(err as Error).message}`);
    } finally {
      approving = false;
    }
  }

  async function handleDispatch(r: ReplacementRequest) {
    actingId = r.id;
    try {
      const updated = await dispatchReplacement(r.id);
      replacements = replacements.map((x) => (x.id === updated.id ? updated : x));
      toast.success('Marked as dispatched');
    } catch (err) {
      toast.error(`Failed: ${(err as Error).message}`);
    } finally {
      actingId = null;
    }
  }

  async function handleReject(r: ReplacementRequest) {
    if (!confirm(`Reject replacement request for ${r.deviceType}?`)) return;
    actingId = r.id;
    try {
      const updated = await rejectReplacement(r.id);
      replacements = replacements.map((x) => (x.id === updated.id ? updated : x));
      toast.success('Replacement request rejected');
    } catch (err) {
      toast.error(`Failed: ${(err as Error).message}`);
    } finally {
      actingId = null;
    }
  }

  const fieldClass =
    'px-3.5 py-2.5 border border-gray-200 rounded-lg text-[13px] text-gray-700 outline-none focus:border-[#0B182A] transition-colors w-full bg-white';
</script>

<svelte:head><title>Device Replacements · NOC · Innoserve Techsol</title></svelte:head>

<div class="flex flex-col gap-5">

  <!-- Header + filter -->
  <div class="flex flex-wrap items-center gap-3 bg-white rounded-xl px-5 py-4 shadow">
    <div>
      <h2 class="text-[18px] font-semibold text-[#0B182A]">Device Replacements</h2>
      <p class="text-[13px] text-gray-400 mt-0.5">Review and action engineer replacement requests</p>
    </div>
    <div class="ml-auto flex items-center gap-2">
      <select
        class="px-3.5 py-2 border border-gray-200 rounded-lg text-[13px] text-gray-700 outline-none focus:border-[#0B182A] transition-colors bg-white cursor-pointer"
        bind:value={filterStatus}
        onchange={loadReplacements}
      >
        <option value="">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="dispatched">Dispatched</option>
        <option value="replaced">Replaced</option>
        <option value="rejected">Rejected</option>
      </select>
      <button
        onclick={loadReplacements}
        class="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-[13px] text-gray-600 hover:border-[#0B182A] transition-colors cursor-pointer"
        title="Refresh"
      >
        <Icons.Activity size={14} />
        Refresh
      </button>
    </div>
  </div>

  <!-- Stats strip -->
  <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
    {#each [
      { label: 'Pending',    value: replacements.filter(r => r.status === 'pending').length,    color: 'text-amber-700'  },
      { label: 'Approved',   value: replacements.filter(r => r.status === 'approved').length,   color: 'text-blue-700'   },
      { label: 'Dispatched', value: replacements.filter(r => r.status === 'dispatched').length, color: 'text-indigo-700' },
      { label: 'Replaced',   value: replacements.filter(r => r.status === 'replaced').length,   color: 'text-green-700'  },
      { label: 'Rejected',   value: replacements.filter(r => r.status === 'rejected').length,   color: 'text-red-600'    },
    ] as stat}
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p class="text-[12px] text-gray-400 mb-1">{stat.label}</p>
        <p class="text-[24px] font-bold {stat.color}">{loading ? '—' : stat.value}</p>
      </div>
    {/each}
  </div>

  <!-- Table -->
  <div class="bg-white rounded-2xl p-6 shadow">
    <div class="overflow-x-auto">
      <table class="w-full text-sm border-collapse">
        <thead>
          <tr class="border-b border-gray-100">
            {#each ['TICKET', 'ENGINEER', 'DEVICE TYPE', 'REASON', 'STATUS', 'REQUESTED', 'ACTIONS'] as col}
              <th class="text-left text-[11px] font-semibold text-gray-400 tracking-wide py-3 px-3 whitespace-nowrap">{col}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#if loading}
            <tr>
              <td colspan="7" class="py-12 text-center text-[13px] text-gray-400">
                <div class="flex items-center justify-center gap-2">
                  <div class="w-4 h-4 border-2 border-gray-200 border-t-fuchsia-500 rounded-full animate-spin"></div>
                  Loading…
                </div>
              </td>
            </tr>
          {:else if replacements.length === 0}
            <tr>
              <td colspan="7" class="py-16 text-center">
                <div class="flex flex-col items-center gap-2">
                  <div class="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                    <Icons.Cube size={22} stroke="#9ca3af" />
                  </div>
                  <p class="text-[13px] text-gray-400">No replacement requests</p>
                </div>
              </td>
            </tr>
          {:else}
            {#each replacements as r}
              <tr class="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                <td class="py-3 px-3 text-[13px] font-semibold text-[#E87D1F] whitespace-nowrap">
                  {r.ticketNumber || r.ticketId.slice(0, 8)}
                </td>
                <td class="py-3 px-3 text-[13px] text-gray-600 whitespace-nowrap">
                  {r.engineerName || r.engineerId.slice(0, 8)}
                </td>
                <td class="py-3 px-3">
                  <span class="flex items-center gap-1.5 text-[13px] text-gray-700 font-medium whitespace-nowrap">
                    <Icons.Cube size={13} stroke="#6b7280" />
                    {r.deviceType}
                  </span>
                </td>
                <td class="py-3 px-3">
                  <p class="text-[13px] text-gray-600 max-w-[220px] truncate" title={r.reason}>{r.reason}</p>
                </td>
                <td class="py-3 px-3">
                  <span class="text-[11px] font-semibold px-2.5 py-1 rounded-full {statusBadge(r.status)}">
                    {statusLabel(r.status)}
                  </span>
                  {#if r.poNumber}
                    <p class="text-[11px] text-gray-400 mt-1">PO: {r.poNumber}</p>
                  {/if}
                </td>
                <td class="py-3 px-3 text-[12px] text-gray-400 whitespace-nowrap">{fmtDate(r.requestedAt)}</td>
                <td class="py-3 px-3">
                  <div class="flex gap-1.5 flex-wrap">
                    {#if r.status === 'pending'}
                      <button
                        onclick={() => openApprove(r)}
                        class="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Icons.CheckCircle size={12} />
                        Approve
                      </button>
                      <button
                        onclick={() => handleReject(r)}
                        disabled={actingId === r.id}
                        class="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
                      >
                        <Icons.XSquare size={12} />
                        Reject
                      </button>
                    {:else if r.status === 'approved'}
                      <button
                        onclick={() => handleDispatch(r)}
                        disabled={actingId === r.id}
                        class="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
                      >
                        <Icons.Activity size={12} />
                        {actingId === r.id ? 'Updating…' : 'Dispatch'}
                      </button>
                      <button
                        onclick={() => handleReject(r)}
                        disabled={actingId === r.id}
                        class="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
                      >
                        <Icons.XSquare size={12} />
                        Reject
                      </button>
                    {:else}
                      <span class="text-[12px] text-gray-400">{statusLabel(r.status)}</span>
                    {/if}
                  </div>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </div>
</div>

<!-- ── Approve Modal ───────────────────────────────────────────────────────── -->
{#if approveTarget}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    role="presentation"
    onclick={() => (approveTarget = null)}
  >
    <div
      class="bg-white rounded-2xl w-full max-w-sm shadow-2xl"
      role="dialog"
      aria-modal="true"
      aria-label="Approve Replacement"
      onclick={(e) => e.stopPropagation()}
    >
      <div class="flex items-start justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <p class="text-[11px] font-semibold text-[#E87D1F] mb-0.5">
            {approveTarget.ticketNumber || approveTarget.ticketId.slice(0, 8)}
          </p>
          <h2 class="text-[15px] font-semibold text-[#0B182A]">Approve Replacement</h2>
          <p class="text-[12px] text-gray-400 mt-0.5">{approveTarget.deviceType}</p>
        </div>
        <button onclick={() => (approveTarget = null)} class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors shrink-0" aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div class="px-6 py-5 flex flex-col gap-4">
        <!-- Reason summary -->
        <div class="px-4 py-3 rounded-xl bg-fuchsia-50 border border-fuchsia-100">
          <p class="text-[11px] font-semibold text-fuchsia-700 mb-1">Engineer's Reason</p>
          <p class="text-[12px] text-fuchsia-800">{approveTarget.reason}</p>
        </div>

        <label class="flex flex-col gap-1.5">
          <span class="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
            PO Number <span class="text-red-400">*</span>
          </span>
          <input
            type="text"
            placeholder="e.g. PO-2024-00123"
            class="{fieldClass} {poError ? 'border-red-300' : ''}"
            bind:value={poNumber}
          />
          {#if poError}<span class="text-[11px] text-red-500">{poError}</span>{/if}
        </label>
      </div>

      <div class="flex justify-end gap-3 px-6 pb-5 border-t border-gray-100 pt-4">
        <button onclick={() => (approveTarget = null)} class="px-5 py-2.5 text-[13px] text-gray-600 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors cursor-pointer">
          Cancel
        </button>
        <button
          onclick={submitApprove}
          disabled={approving}
          class="px-5 py-2.5 text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60 cursor-pointer"
        >
          {approving ? 'Approving…' : 'Approve'}
        </button>
      </div>
    </div>
  </div>
{/if}
