<script lang="ts">
  import { onMount } from 'svelte';
  import * as Icons from '$lib/icons';
  import { toast } from 'svelte-sonner';
  import { fetchTickets, fetchUsersByRole, type Ticket, type User } from '$lib/modules/data/tickets/queries';
  import { updateTicket, createTicketHistory } from '$lib/modules/data/tickets/actions';
  import { fetchEngineerProfiles, type EngineerProfile } from '$lib/modules/data/engineers/queries';

  // ── Constants ─────────────────────────────────────────────────────────────

  // Admin sees the full workflow including Pending Validation and Closed
  const ADMIN_STATUSES = ['Open', 'In Progress', 'Pending Validation', 'Resolved', 'Closed', 'Cancelled'];
  const PRIORITIES = ['High', 'Medium', 'Low'];
  const ESCALATION_LEVELS = ['L2', 'L3'];

  const fieldClass =
    'px-3 py-2 border border-gray-200 rounded-lg text-[13px] text-gray-700 outline-none focus:border-[#0B182A] transition-colors w-full bg-white';

  // ── State ─────────────────────────────────────────────────────────────────

  let allTickets = $state<Ticket[]>([]);
  let engineers = $state<EngineerProfile[]>([]);
  let statePlanners = $state<User[]>([]);
  let loading = $state(true);

  // Filters
  let filterStatus = $state('');
  let filterPriority = $state('');
  let search = $state('');

  // Manage modal
  let actionTicket = $state<Ticket | null>(null);
  let actionStatus = $state('');
  let actionEngineerId = $state('');
  let actionStatePlannerId = $state('');
  let actionEscalate = $state(false);
  let actionEscalationLevel = $state('');
  let actionRemarks = $state('');
  let saving = $state(false);
  let approving = $state(false);

  // ── Derived ───────────────────────────────────────────────────────────────

  let tickets = $derived(
    allTickets.filter((t) => {
      if (filterStatus && t.status !== filterStatus) return false;
      if (filterPriority && t.priority !== filterPriority) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          t.title?.toLowerCase().includes(q) ||
          t.ticketNumber?.toLowerCase().includes(q) ||
          t.state?.toLowerCase().includes(q)
        );
      }
      return true;
    }),
  );

  // ── Helpers ───────────────────────────────────────────────────────────────

  function engineerName(id: string): string {
    if (!id) return '—';
    const e = engineers.find((eng) => eng.userId === id || eng.id === id);
    return e?.userName ?? e?.userEmail ?? id;
  }

  function plannerName(id: string): string {
    if (!id) return '—';
    const u = statePlanners.find((p) => p.id === id);
    return u?.name ?? u?.email ?? id;
  }

  function statusBadge(status: string) {
    const map: Record<string, string> = {
      'Open': 'bg-blue-50 text-blue-600',
      'In Progress': 'bg-amber-50 text-amber-600',
      'Pending Validation': 'bg-purple-50 text-purple-600',
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

  function escalationBadge(level: string) {
    if (level === 'L3') return 'bg-red-50 text-red-600';
    if (level === 'L2') return 'bg-orange-50 text-orange-600';
    return '';
  }

  function fmtDate(d: string) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  // ── Load ──────────────────────────────────────────────────────────────────

  onMount(async () => {
    try {
      [allTickets, engineers, statePlanners] = await Promise.all([
        fetchTickets(),
        fetchEngineerProfiles(),
        fetchUsersByRole('state_planner').catch(() => [] as User[]),
      ]);
    } catch (err) {
      toast.error('Failed to load tickets');
    } finally {
      loading = false;
    }
  });

  // ── Manage modal ──────────────────────────────────────────────────────────

  function openAction(ticket: Ticket) {
    actionTicket = ticket;
    actionStatus = ticket.status;
    actionEngineerId = ticket.assignedEngineerId ?? '';
    actionStatePlannerId = ticket.statePlannerId ?? '';
    actionEscalate = !!ticket.escalationLevel;
    actionEscalationLevel = ticket.escalationLevel ?? '';
    actionRemarks = '';
  }

  async function saveAction() {
    if (!actionTicket) return;
    saving = true;
    try {
      const updated = await updateTicket({
        id: actionTicket.id,
        status: actionStatus,
        assignedEngineerId: actionEngineerId || undefined,
        statePlannerId: actionStatePlannerId || undefined,
        escalationLevel: actionEscalate ? (actionEscalationLevel || undefined) : undefined,
      });

      if (actionStatus !== actionTicket.status || actionRemarks.trim() || actionEscalate) {
        await createTicketHistory({
          ticketId: actionTicket.id,
          status: actionStatus,
          remarks: [
            actionRemarks.trim(),
            actionEscalate && actionEscalationLevel
              ? `Escalated to ${actionEscalationLevel}`
              : '',
          ]
            .filter(Boolean)
            .join(' · ') || undefined,
          author: 'admin',
        });
      }

      allTickets = allTickets.map((t) => (t.id === updated.id ? { ...t, ...updated } : t));
      toast.success('Ticket updated');
      actionTicket = null;
    } catch (err) {
      toast.error(`Update failed: ${(err as Error).message}`);
    } finally {
      saving = false;
    }
  }

  // Approve & Close — only for Pending Validation tickets
  async function approveAndClose(ticket: Ticket) {
    approving = true;
    try {
      const updated = await updateTicket({ id: ticket.id, status: 'Closed' });
      await createTicketHistory({
        ticketId: ticket.id,
        status: 'Closed',
        remarks: 'Approved and closed by admin',
        author: 'admin',
      });
      allTickets = allTickets.map((t) => (t.id === updated.id ? { ...t, ...updated } : t));
      toast.success('Ticket approved and closed');
      actionTicket = null;
    } catch (err) {
      toast.error(`Failed: ${(err as Error).message}`);
    } finally {
      approving = false;
    }
  }
</script>

<svelte:head><title>Tickets · Admin · Innoserve Techsol</title></svelte:head>

<div class="flex flex-col gap-5">

  <!-- Filter / Action Bar -->
  <div class="flex items-center gap-3 flex-wrap bg-white rounded-xl px-5 py-4 shadow">
    <div class="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg flex-1 min-w-[160px] max-w-xs">
      <Icons.Search size={16} stroke="#9ca3af" />
      <input
        type="text"
        placeholder="Search tickets…"
        bind:value={search}
        class="text-[13px] outline-none border-none w-full text-gray-600 placeholder:text-gray-400"
      />
    </div>

    <select
      bind:value={filterStatus}
      class="px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] text-gray-600 bg-white outline-none focus:border-[#0B182A] cursor-pointer"
    >
      <option value="">All Statuses</option>
      {#each ADMIN_STATUSES as s}<option value={s}>{s}</option>{/each}
    </select>

    <select
      bind:value={filterPriority}
      class="px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] text-gray-600 bg-white outline-none focus:border-[#0B182A] cursor-pointer"
    >
      <option value="">All Priorities</option>
      {#each PRIORITIES as p}<option value={p}>{p}</option>{/each}
    </select>

    <span class="text-[12px] text-gray-400 ml-auto">{tickets.length} tickets</span>
  </div>

  <!-- Table Card -->
  <div class="bg-white rounded-2xl p-6 shadow">
    <div class="flex items-center gap-3 mb-4">
      <h3 class="text-[18px] font-semibold text-[#0B182A]">All Tickets</h3>
      <span class="text-[12px] text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
        {allTickets.length} Total
      </span>
      {#if allTickets.filter(t => t.status === 'Pending Validation').length > 0}
        <span class="text-[12px] font-semibold bg-purple-50 text-purple-600 px-3 py-1 rounded-full">
          {allTickets.filter(t => t.status === 'Pending Validation').length} Awaiting Approval
        </span>
      {/if}
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-sm border-collapse">
        <thead>
          <tr class="border-b border-gray-100">
            {#each ['TICKET', 'TITLE', 'STATUS', 'PRIORITY', 'ENGINEER', 'ESCALATION', 'DATE', 'ACTIONS'] as col}
              <th class="text-left text-[11px] font-semibold text-gray-400 tracking-wide py-3 px-3 whitespace-nowrap">
                {col}
              </th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#if loading}
            <tr>
              <td colspan="8" class="py-12 text-center text-[13px] text-gray-400">
                <div class="flex items-center justify-center gap-2">
                  <div class="w-4 h-4 border-2 border-gray-200 border-t-[#0B182A] rounded-full animate-spin"></div>
                  Loading tickets…
                </div>
              </td>
            </tr>
          {:else if tickets.length === 0}
            <tr>
              <td colspan="8" class="py-12 text-center text-[13px] text-gray-400">No tickets found</td>
            </tr>
          {:else}
            {#each tickets as t}
              <tr
                class="border-b border-gray-50 hover:bg-gray-50/60 transition-colors
                       {t.status === 'Pending Validation' ? 'bg-purple-50/30' : ''}"
              >
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
                <td class="py-3 px-3 text-[13px] text-gray-600 whitespace-nowrap">
                  {engineerName(t.assignedEngineerId)}
                </td>
                <td class="py-3 px-3">
                  {#if t.escalationLevel}
                    <span class="text-[11px] font-semibold px-2.5 py-1 rounded-full {escalationBadge(t.escalationLevel)}">
                      {t.escalationLevel}
                    </span>
                  {:else}
                    <span class="text-[12px] text-gray-300">—</span>
                  {/if}
                </td>
                <td class="py-3 px-3 text-[12px] text-gray-400 whitespace-nowrap">{fmtDate(t.createdAt)}</td>
                <td class="py-3 px-3">
                  <div class="flex gap-1.5">
                    {#if t.status === 'Pending Validation'}
                      <!-- Quick approve button for pending validation rows -->
                      <button
                        onclick={() => approveAndClose(t)}
                        disabled={approving}
                        class="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60"
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M20 6L9 17l-5-5"/>
                        </svg>
                        Approve & Close
                      </button>
                    {/if}
                    <button
                      onclick={() => openAction(t)}
                      class="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-[#0B182A]/5 text-[#0B182A] hover:bg-[#0B182A]/10 transition-colors cursor-pointer"
                    >
                      <Icons.Edit size={12} />
                      Manage
                    </button>
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

<!-- ── Manage Ticket Modal ────────────────────────────────────────────────── -->
{#if actionTicket}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    role="presentation"
    onclick={() => (actionTicket = null)}
  >
    <div
      class="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Manage Ticket"
      onclick={(e) => e.stopPropagation()}
    >
      <!-- Header -->
      <div class="flex items-start justify-between px-6 py-4 border-b border-gray-100 shrink-0">
        <div>
          <p class="text-[11px] font-semibold text-[#E87D1F] mb-0.5">
            {actionTicket.ticketNumber || actionTicket.id.slice(0, 8)}
          </p>
          <h2 class="text-[15px] font-semibold text-[#0B182A] leading-tight max-w-[290px]">
            {actionTicket.title}
          </h2>
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

      <!-- Body -->
      <div class="px-6 py-5 flex flex-col gap-4 overflow-y-auto">

        <!-- Pending Validation notice -->
        {#if actionTicket.status === 'Pending Validation'}
          <div class="flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-50 border border-purple-100">
            <div class="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div>
              <p class="text-[13px] font-semibold text-purple-700">Pending Validation</p>
              <p class="text-[11px] text-purple-500 mt-0.5">Engineer has marked this as resolved. Review and approve to close.</p>
            </div>
          </div>
        {/if}

        <!-- Status — admin sees full list -->
        <label class="flex flex-col gap-1.5">
          <span class="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Status</span>
          <select class={fieldClass} bind:value={actionStatus}>
            {#each ADMIN_STATUSES as s}<option value={s}>{s}</option>{/each}
          </select>
        </label>

        <!-- Assign Engineer -->
        <label class="flex flex-col gap-1.5">
          <span class="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Assign Engineer</span>
          <select class={fieldClass} bind:value={actionEngineerId}>
            <option value="">— Unassigned —</option>
            {#each engineers as eng}
              <option value={eng.userId}>{eng.userName ?? eng.userEmail ?? eng.userId}</option>
            {/each}
          </select>
        </label>

        <!-- Assign State Planner -->
        <label class="flex flex-col gap-1.5">
          <span class="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Assign State Planner</span>
          {#if statePlanners.length > 0}
            <select class={fieldClass} bind:value={actionStatePlannerId}>
              <option value="">— Unassigned —</option>
              {#each statePlanners as sp}
                <option value={sp.id}>{sp.name ?? sp.email}</option>
              {/each}
            </select>
          {:else}
            <p class="text-[12px] text-gray-400 italic">
              {#if actionStatePlannerId}
                {plannerName(actionStatePlannerId)}
              {:else}
                No state planners available
              {/if}
            </p>
          {/if}
        </label>

        <!-- Escalation -->
        <div class="flex flex-col gap-2.5">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Request Support</span>
            <button
              type="button"
              onclick={() => { actionEscalate = !actionEscalate; if (!actionEscalate) actionEscalationLevel = ''; }}
              class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer
                     {actionEscalate ? 'bg-[#E87D1F]' : 'bg-gray-200'}"
              role="switch"
              aria-checked={actionEscalate}
            >
              <span
                class="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform
                       {actionEscalate ? 'translate-x-4.5' : 'translate-x-0.5'}"
              ></span>
            </button>
          </div>

          {#if actionEscalate}
            <div class="flex gap-2">
              {#each ESCALATION_LEVELS as lvl}
                <button
                  type="button"
                  onclick={() => (actionEscalationLevel = lvl)}
                  class="flex-1 py-2 text-[13px] font-semibold rounded-lg border transition-all cursor-pointer
                         {actionEscalationLevel === lvl
                           ? lvl === 'L3'
                             ? 'bg-red-500 text-white border-red-500'
                             : 'bg-[#E87D1F] text-white border-[#E87D1F]'
                           : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}"
                >
                  {lvl}
                </button>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Remarks -->
        <label class="flex flex-col gap-1.5">
          <span class="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Remarks (optional)</span>
          <textarea
            bind:value={actionRemarks}
            placeholder="Add a note about this update…"
            rows="3"
            class="{fieldClass} resize-none"
          ></textarea>
        </label>
      </div>

      <!-- Footer -->
      <div class="flex justify-end gap-2 px-6 pb-5 border-t border-gray-100 pt-4 shrink-0">
        <button
          onclick={() => (actionTicket = null)}
          class="px-4 py-2.5 text-[13px] text-gray-600 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors cursor-pointer"
        >
          Cancel
        </button>

        {#if actionTicket.status === 'Pending Validation'}
          <!-- Approve & Close is the primary CTA when in pending validation -->
          <button
            onclick={() => approveAndClose(actionTicket!)}
            disabled={approving}
            class="px-4 py-2.5 text-[13px] font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-60 cursor-pointer"
          >
            {approving ? 'Approving…' : 'Approve & Close'}
          </button>
        {/if}

        <button
          onclick={saveAction}
          disabled={saving}
          class="px-4 py-2.5 text-[13px] font-semibold text-white bg-[linear-gradient(to_bottom,#0B182A,#021E44)] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 cursor-pointer"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  </div>
{/if}
