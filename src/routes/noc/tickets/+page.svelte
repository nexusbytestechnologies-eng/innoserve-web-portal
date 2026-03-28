<script lang="ts">
  import { onMount } from 'svelte';
  import * as Icons from '$lib/icons';
  import { toast } from 'svelte-sonner';
  import { authStore } from '$lib/stores/auth';
  import { fetchTickets, type Ticket } from '$lib/modules/data/tickets/queries';
  import { updateTicket, createTicketHistory } from '$lib/modules/data/tickets/actions';

  const user = $derived($authStore.user);

  // ── State ─────────────────────────────────────────────────────────────────

  let tickets = $state<Ticket[]>([]);
  let loading = $state(true);

  // Validation modal (Approve & Close / Close Ticket)
  let actionTicket = $state<Ticket | null>(null);
  let actionType = $state<'approve' | 'close'>('approve');
  let actionRemarks = $state('');
  let actioning = $state(false);

  // ── Load ──────────────────────────────────────────────────────────────────

  onMount(async () => {
    try {
      tickets = await fetchTickets();
    } catch {
      toast.error('Failed to load tickets');
    } finally {
      loading = false;
    }
  });

  // ── Helpers ───────────────────────────────────────────────────────────────

  function statusBadge(status: string) {
    const map: Record<string, string> = {
      'Open': 'bg-blue-50 text-blue-600',
      'In Progress': 'bg-amber-50 text-amber-600',
      'Pending Validation': 'bg-purple-50 text-purple-700',
      'Resolved': 'bg-green-50 text-green-600',
      'Closed': 'bg-gray-100 text-gray-500',
      'Cancelled': 'bg-red-50 text-red-500',
    };
    return map[status] ?? 'bg-gray-100 text-gray-500';
  }

  function priorityBadge(p: string) {
    if (p === 'High') return 'bg-red-50 text-red-500';
    if (p === 'Medium') return 'bg-amber-50 text-amber-500';
    return 'bg-green-50 text-green-600';
  }

  function fmtDate(d: string) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function canAct(t: Ticket) {
    return !['Closed', 'Cancelled'].includes(t.status);
  }

  // ── Action modal ──────────────────────────────────────────────────────────

  function openApprove(ticket: Ticket) {
    actionTicket = ticket;
    actionType = 'approve';
    actionRemarks = '';
  }

  function openClose(ticket: Ticket) {
    actionTicket = ticket;
    actionType = 'close';
    actionRemarks = '';
  }

  async function saveAction() {
    if (!actionTicket) return;
    actioning = true;
    const newStatus = 'Closed';
    const defaultRemarks =
      actionType === 'approve'
        ? 'Validated and approved — ticket closed'
        : 'Closed by NOC';
    try {
      await createTicketHistory({
        ticketId: actionTicket.id,
        status: newStatus,
        remarks: actionRemarks.trim() || defaultRemarks,
        author: user?.id ?? 'noc',
      });
      const updated = await updateTicket({ id: actionTicket.id, status: newStatus });
      tickets = tickets.map((t) => (t.id === updated.id ? { ...t, ...updated } : t));
      toast.success(actionType === 'approve' ? 'Ticket approved and closed' : 'Ticket closed');
      actionTicket = null;
    } catch (err) {
      toast.error(`Failed: ${(err as Error).message}`);
    } finally {
      actioning = false;
    }
  }

  const fieldClass =
    'px-3.5 py-2.5 border border-gray-200 rounded-lg text-[13px] text-gray-700 outline-none focus:border-[#0B182A] transition-colors w-full bg-white';
</script>

<svelte:head><title>Tickets · NOC · Innoserve Techsol</title></svelte:head>

<div class="flex flex-col gap-5">

  <!-- Stats -->
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
    {#each [
      { label: 'Total', value: tickets.length, color: 'text-[#0B182A]' },
      { label: 'Pending Validation', value: tickets.filter(t => t.status === 'Pending Validation').length, color: 'text-purple-700' },
      { label: 'Open / In Progress', value: tickets.filter(t => ['Open','In Progress'].includes(t.status)).length, color: 'text-amber-600' },
      { label: 'Closed', value: tickets.filter(t => t.status === 'Closed').length, color: 'text-gray-500' },
    ] as stat}
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p class="text-[12px] text-gray-400 mb-1">{stat.label}</p>
        <p class="text-[24px] font-bold {stat.color}">{loading ? '—' : stat.value}</p>
      </div>
    {/each}
  </div>

  <!-- Table -->
  <div class="bg-white rounded-2xl p-6 shadow">
    <div class="flex items-center gap-3 mb-4">
      <h3 class="text-[18px] font-semibold text-[#0B182A]">All Tickets</h3>
      <span class="text-[12px] text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{tickets.length} Total</span>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-sm border-collapse">
        <thead>
          <tr class="border-b border-gray-100">
            {#each ['TICKET', 'ISSUE', 'STATUS', 'PRIORITY', 'ESCALATION', 'DATE', 'ACTIONS'] as col}
              <th class="text-left text-[11px] font-semibold text-gray-400 tracking-wide py-3 px-3 whitespace-nowrap">{col}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#if loading}
            <tr>
              <td colspan="7" class="py-12 text-center text-[13px] text-gray-400">
                <div class="flex items-center justify-center gap-2">
                  <div class="w-4 h-4 border-2 border-gray-200 border-t-[#0B182A] rounded-full animate-spin"></div>
                  Loading…
                </div>
              </td>
            </tr>
          {:else if tickets.length === 0}
            <tr>
              <td colspan="7" class="py-16 text-center">
                <div class="flex flex-col items-center gap-2">
                  <div class="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                    <Icons.Ticket size={22} stroke="#9ca3af" />
                  </div>
                  <p class="text-[13px] text-gray-400">No tickets found</p>
                </div>
              </td>
            </tr>
          {:else}
            {#each tickets as t}
              <tr class="border-b border-gray-50 hover:bg-gray-50/60 transition-colors
                         {t.status === 'Pending Validation' ? 'bg-purple-50/30' : ''}">
                <td class="py-3 px-3 text-[13px] font-semibold text-[#E87D1F] whitespace-nowrap">
                  {t.ticketNumber || t.id.slice(0, 8)}
                </td>
                <td class="py-3 px-3">
                  <p class="text-[13px] font-medium text-gray-800 max-w-[180px] truncate">{t.title}</p>
                  {#if t.description}
                    <p class="text-[11px] text-gray-400 max-w-[180px] truncate">{t.description}</p>
                  {/if}
                </td>
                <td class="py-3 px-3">
                  <span class="text-[11px] font-semibold px-2.5 py-1 rounded-full {statusBadge(t.status)}">
                    {t.status || '—'}
                  </span>
                </td>
                <td class="py-3 px-3">
                  <span class="text-[11px] font-semibold px-2.5 py-1 rounded-full {priorityBadge(t.priority)}">
                    {t.priority || '—'}
                  </span>
                </td>
                <td class="py-3 px-3">
                  {#if t.escalationLevel}
                    <span class="text-[11px] font-semibold px-2.5 py-1 rounded-full
                                 {t.escalationLevel === 'L3' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}">
                      {t.escalationLevel}
                    </span>
                  {:else}
                    <span class="text-[12px] text-gray-300">—</span>
                  {/if}
                </td>
                <td class="py-3 px-3 text-[12px] text-gray-400 whitespace-nowrap">{fmtDate(t.createdAt)}</td>
                <td class="py-3 px-3">
                  {#if canAct(t)}
                    <div class="flex gap-1.5 flex-wrap">
                      <!-- Approve & Close — only when pending validation -->
                      {#if t.status === 'Pending Validation'}
                        <button
                          onclick={() => openApprove(t)}
                          title="Approve and close this ticket"
                          class="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <Icons.CheckCircle size={12} />
                          Approve &amp; Close
                        </button>
                      {/if}

                      <!-- Close Ticket — any non-closed ticket -->
                      <button
                        onclick={() => openClose(t)}
                        title="Close this ticket"
                        class="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Icons.XSquare size={12} />
                        Close
                      </button>
                    </div>
                  {:else}
                    <span class="text-[12px] text-gray-400">{t.status}</span>
                  {/if}
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </div>
</div>

<!-- ── Action Modal (Approve & Close / Close Ticket) ──────────────────────── -->
{#if actionTicket}
  <!-- svelte-ignore a11y_interactive_supports_focus -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    role="presentation"
    onclick={() => (actionTicket = null)}
  >
    <div
      class="bg-white rounded-2xl w-full max-w-sm shadow-2xl"
      role="dialog"
      aria-modal="true"
      tabindex="-1"
      aria-label={actionType === 'approve' ? 'Approve & Close Ticket' : 'Close Ticket'}
      onclick={(e) => e.stopPropagation()}
    >
      <div class="flex items-start justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <p class="text-[11px] font-semibold text-[#E87D1F] mb-0.5">
            {actionTicket.ticketNumber || actionTicket.id.slice(0, 8)}
          </p>
          <h2 class="text-[15px] font-semibold text-[#0B182A] leading-tight max-w-[220px]">
            {actionType === 'approve' ? 'Approve & Close Ticket' : 'Close Ticket'}
          </h2>
          <p class="text-[12px] text-gray-400 mt-0.5">
            {actionType === 'approve'
              ? 'Confirm the work is validated and close this ticket'
              : 'Mark this ticket as closed'}
          </p>
        </div>
        <button
          onclick={() => (actionTicket = null)}
          class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
          aria-label="Close"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="px-6 py-5 flex flex-col gap-4">
        {#if actionType === 'approve'}
          <div class="flex items-start gap-3 px-4 py-3 rounded-xl bg-green-50 border border-green-100">
            <Icons.CheckCircle size={16} stroke="#16a34a" />
            <p class="text-[12px] text-green-700 leading-relaxed">
              This will mark the ticket as <strong>Closed</strong> and log a validation approval in the history.
            </p>
          </div>
        {:else}
          <div class="flex items-start gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200">
            <Icons.XSquare size={16} stroke="#6b7280" />
            <p class="text-[12px] text-gray-600 leading-relaxed">
              Closing this ticket will set its status to <strong>Closed</strong>. This action can only be undone by an admin.
            </p>
          </div>
        {/if}

        <label class="flex flex-col gap-1.5">
          <span class="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Remarks (optional)</span>
          <textarea
            bind:value={actionRemarks}
            placeholder="Add a note about this decision…"
            rows="3"
            class="{fieldClass} resize-none"
          ></textarea>
        </label>
      </div>

      <div class="flex justify-end gap-3 px-6 pb-5 border-t border-gray-100 pt-4">
        <button
          onclick={() => (actionTicket = null)}
          class="px-5 py-2.5 text-[13px] text-gray-600 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          onclick={saveAction}
          disabled={actioning}
          class="px-5 py-2.5 text-[13px] font-semibold text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 cursor-pointer
                 {actionType === 'approve' ? 'bg-green-600' : 'bg-[linear-gradient(to_bottom,#0B182A,#021E44)]'}"
        >
          {actioning
            ? 'Saving…'
            : actionType === 'approve'
              ? 'Approve & Close'
              : 'Close Ticket'}
        </button>
      </div>
    </div>
  </div>
{/if}
