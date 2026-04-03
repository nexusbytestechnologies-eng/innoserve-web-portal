<script lang="ts">
  import { onMount } from 'svelte';
  import * as Icons from '$lib/icons';
  import { toast } from 'svelte-sonner';
  import { authStore } from '$lib/stores/auth';
  import { fetchTickets, type Ticket } from '$lib/modules/data/tickets/queries';
  import {
    createTicketHistory,
    requestReplacement,
    uploadTicketAttachment,
  } from '$lib/modules/data/tickets/actions';
  import { escalateTicket, updateTicketStatus } from '$lib/api/tickets';
  import {
    fetchTicketReplacement,
    type ReplacementRequest,
  } from '$lib/api/replacements';
  import { ROLE_STATUS_OPTIONS, TICKET_STATUS_LABELS, type TicketStatus } from '$lib/config/roles';
  import { ApiError } from '$lib/api/rest';
  import { fetchProjects, type Project } from '$lib/modules/data/projects/queries';
  import ClosureChecklist from '$lib/modules/data/tickets/ClosureChecklist.svelte';
  import { queryVersion } from '$lib/stores/query';
  import Pagination from '$lib/components/Pagination.svelte';

  const user = $derived($authStore.user);

  // ── Constants ─────────────────────────────────────────────────────────────

  // Engineers can move to In Progress or Resolved only.
  // "Send for Validation" is a separate direct action (resolved → pending_validation).
  const ENGINEER_STATUSES = ROLE_STATUS_OPTIONS.engineer;
  const ESCALATION_LEVELS = ['L2', 'L3'] as const;

  function normalizeStatus(s: string): string {
    return (s ?? '').toLowerCase().replace(/ /g, '_');
  }

  function statusLabel(s: string): string {
    return TICKET_STATUS_LABELS[normalizeStatus(s) as keyof typeof TICKET_STATUS_LABELS] ?? s ?? '—';
  }

  const fieldClass =
    'px-3.5 py-2.5 border border-gray-200 rounded-lg text-[13px] text-gray-700 outline-none focus:border-[#0B182A] transition-colors w-full bg-white';

  // ── State ─────────────────────────────────────────────────────────────────

  let tickets = $state<Ticket[]>([]);
  let projects = $state<Project[]>([]);
  let loading = $state(true);

  // Status update modal
  let statusTicket = $state<Ticket | null>(null);
  let newStatus = $state<TicketStatus>('in_progress');
  let remarks = $state('');
  let statusSaving = $state(false);

  // Escalation modal
  let escalateModal = $state<Ticket | null>(null);
  let escalationLevel = $state<'L2' | 'L3' | ''>('');
  let escalationReason = $state('');
  let escalating = $state(false);

  let replacingTicket = $state(false);
  let replacingTicketId = $state<string | null>(null);

  // Replacement status tracker
  let trackerTicket = $state<Ticket | null>(null);
  let trackerData = $state<ReplacementRequest | null>(null);
  let trackerLoading = $state(false);

  // Upload proof modal
  let uploadTicket = $state<Ticket | null>(null);
  let irFileInput = $state<HTMLInputElement | null>(null);
  let siteImageInput = $state<HTMLInputElement | null>(null);
  let selectedIrFile = $state<File | null>(null);
  let selectedSiteFiles = $state<File[]>([]);
  let uploadingIr = $state(false);
  let uploadingSiteImages = $state(false);
  let checklistRefreshKey = $state(0);
  let lastSeenTicketsVersion = $state<number | null>(null);

  // ── Load ──────────────────────────────────────────────────────────────────

  async function loadTickets() {
    const all = await fetchTickets();
    tickets = user ? all.filter((t) => t.assignedEngineerId === user.id) : all;
  }

  onMount(async () => {
    try {
      const [, projs] = await Promise.all([
        loadTickets(),
        fetchProjects().catch(() => [] as Project[]),
      ]);
      projects = projs;
    } catch (err) {
      toast.error('Failed to load tickets');
    } finally {
      loading = false;
    }
  });

  $effect(() => {
    const version = $queryVersion.tickets;
    if (lastSeenTicketsVersion === null) {
      lastSeenTicketsVersion = version;
      return;
    }
    if (version === lastSeenTicketsVersion) return;
    lastSeenTicketsVersion = version;
    void loadTickets().catch(() => {
      toast.error('Failed to refresh tickets');
    });
  });

  function projectName(id: string): string {
    if (!id) return '—';
    return projects.find((p) => p.id === id)?.name ?? '—';
  }

  // ── Pagination ────────────────────────────────────────────────────────────
  const PAGE_SIZE = 15;
  let currentPage = $state(1);
  const totalPages   = $derived(Math.max(1, Math.ceil(tickets.length / PAGE_SIZE)));
  const pagedTickets = $derived(tickets.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE));

  // ── Helpers ───────────────────────────────────────────────────────────────

  function statusBadge(status: string) {
    const map: Record<string, string> = {
      'open': 'bg-blue-50 text-blue-600',
      'assigned': 'bg-indigo-50 text-indigo-600',
      'in_progress': 'bg-amber-50 text-amber-600',
      'on_hold': 'bg-yellow-50 text-yellow-700',
      'pending_replacement': 'bg-fuchsia-50 text-fuchsia-700',
      'escalated_l2': 'bg-orange-50 text-orange-600',
      'escalated_l3': 'bg-red-50 text-red-600',
      'pending_validation': 'bg-purple-50 text-purple-600',
      'resolved': 'bg-green-50 text-green-600',
      'closed': 'bg-gray-100 text-gray-500',
      'reopened': 'bg-cyan-50 text-cyan-700',
    };
    return map[normalizeStatus(status)] ?? 'bg-gray-100 text-gray-500';
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

  // Can the engineer still act on this ticket?
  function canAct(ticket: Ticket): boolean {
    return !['closed'].includes(normalizeStatus(ticket.status));
  }

  // ── Status update ─────────────────────────────────────────────────────────

  function openStatus(ticket: Ticket) {
    statusTicket = ticket;
    const ns = normalizeStatus(ticket.status);
    newStatus = (ns === 'open' || ns === 'assigned' ? 'in_progress' : ns) as TicketStatus;
    remarks = '';
  }

  async function saveStatus() {
    if (!statusTicket) return;
    statusSaving = true;
    try {
      await createTicketHistory({
        ticketId: statusTicket.id,
        status: newStatus,
        remarks: remarks.trim() || undefined,
        author: user?.id ?? 'engineer',
      });
      const updated = await updateTicketStatus(
        statusTicket.id,
        newStatus,
        remarks.trim() || undefined,
      );
      tickets = tickets.map((t) => (t.id === updated.id ? { ...t, ...updated } : t));

      if (newStatus === 'pending_validation') {
        toast.success('Ticket submitted for admin validation');
      } else {
        toast.success('Status updated');
      }
      statusTicket = null;
    } catch (err) {
      toast.error(`Failed: ${(err as Error).message}`);
    } finally {
      statusSaving = false;
    }
  }

  // ── Send for Validation ───────────────────────────────────────────────────

  let sendingValidation = $state<string | null>(null); // ticket id being sent

  async function sendForValidation(ticket: Ticket) {
    sendingValidation = ticket.id;
    try {
      await createTicketHistory({
        ticketId: ticket.id,
        status: 'pending_validation',
        remarks: 'Sent for admin validation',
        author: user?.id ?? 'engineer',
      });
      const updated = await updateTicketStatus(
        ticket.id,
        'pending_validation',
        'Sent for admin validation',
      );
      tickets = tickets.map((t) => (t.id === updated.id ? { ...t, ...updated } : t));
      toast.success('Ticket submitted for validation');
    } catch (err) {
      toast.error(`Failed: ${(err as Error).message}`);
    } finally {
      sendingValidation = null;
    }
  }

  // ── Escalation ────────────────────────────────────────────────────────────

  function openEscalate(ticket: Ticket) {
    escalateModal = ticket;
    escalationLevel = ticket.escalationLevel as 'L2' | 'L3' | '' ?? '';
    escalationReason = '';
  }

  async function saveEscalation() {
    if (!escalateModal || !escalationLevel) return;
    escalating = true;
    try {
      const updated = await escalateTicket(escalateModal.id, {
        level: escalationLevel,
        reason: escalationReason.trim() || `Support requested: ${escalationLevel}`,
      });
      await createTicketHistory({
        ticketId: escalateModal.id,
        status: normalizeStatus(escalateModal.status),
        remarks: `Support requested: ${escalationLevel}${escalationReason.trim() ? ` — ${escalationReason.trim()}` : ''}`,
        author: user?.id ?? 'engineer',
      });
      tickets = tickets.map((t) => (t.id === updated.id ? { ...t, ...updated } : t));
      toast.success(`Support request sent (${escalationLevel})`);
      escalateModal = null;
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        toast.error('Unauthorized: cannot escalate this ticket');
      } else {
        toast.error(`Failed: ${(err as Error).message}`);
      }
    } finally {
      escalating = false;
    }
  }

  // ── Upload proof ──────────────────────────────────────────────────────────

  function openUpload(ticket: Ticket) {
    uploadTicket = ticket;
    selectedIrFile = null;
    selectedSiteFiles = [];
    checklistRefreshKey += 1;
  }

  function handleIrFileChange(e: Event) {
    selectedIrFile = (e.currentTarget as HTMLInputElement).files?.[0] ?? null;
  }

  function handleSiteImageChange(e: Event) {
    selectedSiteFiles = Array.from((e.currentTarget as HTMLInputElement).files ?? []);
  }

  async function submitIrUpload() {
    if (!uploadTicket || !selectedIrFile) return;
    uploadingIr = true;
    try {
      await uploadTicketAttachment({
        ticketId: uploadTicket.id,
        file: selectedIrFile,
        type: 'ir_report',
        author: user?.id ?? 'engineer',
      });
      selectedIrFile = null;
      if (irFileInput) irFileInput.value = '';
      checklistRefreshKey += 1;
      toast.success('IR uploaded successfully');
    } catch (err) {
      toast.error(`Upload failed: ${(err as Error).message}`);
    } finally {
      uploadingIr = false;
    }
  }

  async function submitSiteImages() {
    if (!uploadTicket || selectedSiteFiles.length === 0) return;
    const ticketId = uploadTicket.id;
    uploadingSiteImages = true;
    try {
      await Promise.all(
        selectedSiteFiles.map((file) =>
          uploadTicketAttachment({
            ticketId,
            file,
            type: 'site_image',
            author: user?.id ?? 'engineer',
          }),
        ),
      );
      selectedSiteFiles = [];
      if (siteImageInput) siteImageInput.value = '';
      checklistRefreshKey += 1;
      toast.success('Site image(s) uploaded successfully');
    } catch (err) {
      toast.error(`Upload failed: ${(err as Error).message}`);
    } finally {
      uploadingSiteImages = false;
    }
  }

  // ── Device Replacement ────────────────────────────────────────────────────

  async function requestTicketReplacement(ticket: Ticket) {
    replacingTicket = true;
    replacingTicketId = ticket.id;
    try {
      await requestReplacement(ticket.id);
      tickets = tickets.map((t) =>
        t.id === ticket.id ? { ...t, status: 'pending_replacement' } : t,
      );
      toast.success('Replacement request submitted successfully');
    } catch (err) {
      toast.error(`Failed: ${(err as Error).message}`);
    } finally {
      replacingTicket = false;
      replacingTicketId = null;
    }
  }

  async function openTracker(ticket: Ticket) {
    trackerTicket = ticket;
    trackerData = null;
    trackerLoading = true;
    try {
      trackerData = await fetchTicketReplacement(ticket.id);
    } finally {
      trackerLoading = false;
    }
  }
</script>

<svelte:head><title>My Tickets · Engineer · Innoserve Techsol</title></svelte:head>

<div class="flex flex-col gap-5">

  <!-- Stats -->
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
    {#each [
      { label: 'Open', value: tickets.filter(t => normalizeStatus(t.status) === 'open').length, color: 'text-blue-600' },
      { label: 'In Progress', value: tickets.filter(t => normalizeStatus(t.status) === 'in_progress').length, color: 'text-amber-600' },
      { label: 'Pending Validation', value: tickets.filter(t => normalizeStatus(t.status) === 'pending_validation').length, color: 'text-purple-600' },
      { label: 'Resolved', value: tickets.filter(t => normalizeStatus(t.status) === 'resolved').length, color: 'text-green-600' },
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
      <h3 class="text-[18px] font-semibold text-[#0B182A]">Assigned Tickets</h3>
      <span class="text-[12px] text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{tickets.length} Total</span>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-sm border-collapse">
        <thead>
          <tr class="border-b border-gray-100">
            {#each ['TICKET', 'PROJECT', 'ISSUE', 'STATUS', 'PRIORITY', 'ESCALATION', 'DATE', 'ACTIONS'] as col}
              <th class="text-left text-[11px] font-semibold text-gray-400 tracking-wide py-3 px-3 whitespace-nowrap">{col}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#if loading}
            <tr>
              <td colspan="8" class="py-12 text-center text-[13px] text-gray-400">
                <div class="flex items-center justify-center gap-2">
                  <div class="w-4 h-4 border-2 border-gray-200 border-t-[#0B182A] rounded-full animate-spin"></div>
                  Loading…
                </div>
              </td>
            </tr>
          {:else if tickets.length === 0}
            <tr>
              <td colspan="8" class="py-16 text-center">
                <div class="flex flex-col items-center gap-2">
                  <div class="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                    <Icons.Ticket size={22} stroke="#9ca3af" />
                  </div>
                  <p class="text-[13px] text-gray-400">No tickets assigned to you yet</p>
                </div>
              </td>
            </tr>
          {:else}
            {#each pagedTickets as t}
              <tr class="border-b border-gray-50 hover:bg-gray-50/60 transition-colors
                         {normalizeStatus(t.status) === 'pending_validation' ? 'bg-purple-50/20' : ''}">
                <td class="py-3 px-3 text-[13px] font-semibold text-[#E87D1F] whitespace-nowrap">
                  {t.ticketNumber || t.id.slice(0, 8)}
                </td>
                <td class="py-3 px-3 text-[13px] text-gray-600 whitespace-nowrap">{projectName(t.projectId)}</td>
                <td class="py-3 px-3">
                  <p class="text-[13px] font-medium text-gray-800 max-w-[180px] truncate">{t.title}</p>
                  {#if t.description}
                    <p class="text-[11px] text-gray-400 max-w-[180px] truncate">{t.description}</p>
                  {/if}
                </td>
                <td class="py-3 px-3">
                  <span class="text-[11px] font-semibold px-2.5 py-1 rounded-full {statusBadge(t.status)}">
                    {statusLabel(t.status)}
                  </span>
                </td>
                <td class="py-3 px-3">
                  <span class="text-[11px] font-semibold px-2.5 py-1 rounded-full {priorityBadge(t.priority)}">
                    {t.priority || '—'}
                  </span>
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
                  {#if canAct(t)}
                    <div class="flex gap-1.5 flex-wrap">
                      {#if normalizeStatus(t.status) === 'in_progress'}
                        <button
                          onclick={() => requestTicketReplacement(t)}
                          disabled={replacingTicketId === t.id}
                          class="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-fuchsia-50 text-fuchsia-700 hover:bg-fuchsia-100 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <Icons.Cube size={12} />
                          {replacingTicketId === t.id ? 'Requesting…' : 'Replace'}
                        </button>
                      {/if}
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
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={tickets.length}
      pageSize={PAGE_SIZE}
      itemLabel="tickets"
      loading={loading}
      onchange={(p) => (currentPage = p)}
    />
  </div>
</div>

<!-- ── Update Status Modal ───────────────────────────────────────────────── -->
{#if statusTicket}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    role="presentation"
    onclick={() => (statusTicket = null)}
  >
    <div
      class="bg-white rounded-2xl w-full max-w-sm shadow-2xl"
      role="dialog"
      aria-modal="true"
      aria-label="Update Status"
      onclick={(e) => e.stopPropagation()}
    >
      <div class="flex items-start justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <p class="text-[11px] font-semibold text-[#E87D1F] mb-0.5">
            {statusTicket.ticketNumber || statusTicket.id.slice(0, 8)}
          </p>
          <h2 class="text-[15px] font-semibold text-[#0B182A] max-w-[230px] leading-tight">{statusTicket.title}</h2>
        </div>
        <button onclick={() => (statusTicket = null)} class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors shrink-0" aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div class="px-6 py-5 flex flex-col gap-4">
        <!-- Engineer-limited status options -->
        <div class="flex flex-col gap-1.5">
          <span class="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">New Status</span>
          <div class="flex flex-col gap-2 mt-1">
            {#each ENGINEER_STATUSES as s}
              <button
                type="button"
                onclick={() => (newStatus = s)}
                class="flex items-center gap-3 px-4 py-3 rounded-xl border text-[13px] font-medium transition-all cursor-pointer text-left
                       {newStatus === s
                         ? s === 'pending_validation'
                           ? 'bg-purple-50 border-purple-200 text-purple-700'
                           : 'bg-[#0B182A] border-[#0B182A] text-white'
                         : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'}"
              >
                <span class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                             {newStatus === s ? 'border-current' : 'border-gray-300'}">
                  {#if newStatus === s}
                    <span class="w-2.5 h-2.5 rounded-full bg-current"></span>
                  {/if}
                </span>
                {statusLabel(s)}
                {#if s === 'pending_validation'}
                  <span class="ml-auto text-[10px] font-semibold opacity-60">Sends to admin</span>
                {/if}
              </button>
            {/each}
          </div>
        </div>

        <label class="flex flex-col gap-1.5">
          <span class="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Remarks</span>
          <textarea
            bind:value={remarks}
            placeholder="Describe work done or observations…"
            rows="3"
            class="{fieldClass} resize-none"
          ></textarea>
        </label>
      </div>

      <div class="flex justify-end gap-3 px-6 pb-5 border-t border-gray-100 pt-4">
        <button onclick={() => (statusTicket = null)} class="px-5 py-2.5 text-[13px] text-gray-600 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors cursor-pointer">
          Cancel
        </button>
        <button
          onclick={saveStatus}
          disabled={statusSaving}
          class="px-5 py-2.5 text-[13px] font-semibold text-white bg-[linear-gradient(to_bottom,#0B182A,#021E44)] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 cursor-pointer"
        >
          {statusSaving ? 'Saving…' : 'Update Status'}
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- ── Escalation / Request Support Modal ────────────────────────────────── -->
{#if escalateModal}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    role="presentation"
    onclick={() => (escalateModal = null)}
  >
    <div
      class="bg-white rounded-2xl w-full max-w-sm shadow-2xl"
      role="dialog"
      aria-modal="true"
      aria-label="Request Support"
      onclick={(e) => e.stopPropagation()}
    >
      <div class="flex items-start justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <p class="text-[11px] font-semibold text-[#E87D1F] mb-0.5">
            {escalateModal.ticketNumber || escalateModal.id.slice(0, 8)}
          </p>
          <h2 class="text-[15px] font-semibold text-[#0B182A]">Request Support</h2>
          <p class="text-[12px] text-gray-400 mt-0.5">Escalate this ticket to a higher support level</p>
        </div>
        <button onclick={() => (escalateModal = null)} class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors shrink-0" aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div class="px-6 py-5 flex flex-col gap-4">
        <!-- L2 / L3 selector -->
        <div class="flex flex-col gap-2">
          <span class="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Escalation Level</span>
          <div class="grid grid-cols-2 gap-3 mt-1">
            {#each ESCALATION_LEVELS as lvl}
              <button
                type="button"
                onclick={() => (escalationLevel = lvl)}
                class="flex flex-col items-center gap-1.5 px-4 py-4 rounded-xl border-2 transition-all cursor-pointer
                       {escalationLevel === lvl
                         ? lvl === 'L3'
                           ? 'bg-red-50 border-red-400 text-red-700'
                           : 'bg-orange-50 border-orange-400 text-orange-700'
                         : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400'}"
              >
                <span class="text-[22px] font-bold leading-none">{lvl}</span>
                <span class="text-[11px] font-medium">
                  {lvl === 'L2' ? 'Level 2 Support' : 'Level 3 Specialist'}
                </span>
              </button>
            {/each}
          </div>
        </div>

        <!-- Warning for L3 -->
        {#if escalationLevel === 'L3'}
          <div class="flex items-start gap-2.5 px-3 py-3 rounded-lg bg-red-50 border border-red-100">
            <Icons.AlertTriangle size={15} stroke="#ef4444" />
            <p class="text-[12px] text-red-600">
              L3 escalation is for critical issues only. This will notify senior specialists immediately.
            </p>
          </div>
        {/if}

        <label class="flex flex-col gap-1.5">
          <span class="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Reason</span>
          <textarea
            bind:value={escalationReason}
            placeholder="Describe why you need additional support…"
            rows="3"
            class="{fieldClass} resize-none"
          ></textarea>
        </label>
      </div>

      <div class="flex justify-end gap-3 px-6 pb-5 border-t border-gray-100 pt-4">
        <button onclick={() => (escalateModal = null)} class="px-5 py-2.5 text-[13px] text-gray-600 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors cursor-pointer">
          Cancel
        </button>
        <button
          onclick={saveEscalation}
          disabled={!escalationLevel || escalating}
          class="px-5 py-2.5 text-[13px] font-semibold text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 cursor-pointer
                 {escalationLevel === 'L3' ? 'bg-red-500' : 'bg-[#E87D1F]'}"
        >
          {escalating ? 'Sending…' : `Request ${escalationLevel || '…'} Support`}
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- ── Upload Ticket Documents Modal ──────────────────────────────────────── -->
{#if uploadTicket}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    role="presentation"
    onclick={() => (uploadTicket = null)}
  >
    <div
      class="bg-white rounded-2xl w-full max-w-2xl shadow-2xl"
      role="dialog"
      aria-modal="true"
      tabindex="-1"
      aria-label="Upload Ticket Documents"
      onclick={(e) => e.stopPropagation()}
    >
      <div class="flex items-start justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <p class="text-[11px] font-semibold text-[#E87D1F] mb-0.5">
            {uploadTicket.ticketNumber || uploadTicket.id.slice(0, 8)}
          </p>
          <h2 class="text-[15px] font-semibold text-[#0B182A]">Upload Resolution Documents</h2>
        </div>
        <button onclick={() => (uploadTicket = null)} class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors shrink-0" aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div class="px-6 py-5 flex flex-col gap-5">
        <ClosureChecklist ticketId={uploadTicket.id} refreshKey={checklistRefreshKey} />

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div class="border border-gray-200 rounded-2xl p-5 flex flex-col gap-4">
            <div>
              <h3 class="text-[14px] font-semibold text-[#0B182A]">Upload Incident Report (IR)</h3>
              <p class="text-[12px] text-gray-400 mt-1">Accepted formats: PDF, DOC, DOCX</p>
            </div>
            <label class="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#0B182A] hover:bg-gray-50 transition-colors">
              <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Icons.File size={20} stroke="#6b7280" />
              </div>
              <div class="text-center">
                <p class="text-[13px] font-medium text-gray-700">Select IR document</p>
                <p class="text-[11px] text-gray-400 mt-0.5">One report file per upload</p>
              </div>
              {#if selectedIrFile}
                <span class="text-[12px] font-medium text-[#0B182A] bg-gray-100 px-3 py-1 rounded-full max-w-full truncate">
                  {selectedIrFile.name}
                </span>
              {/if}
              <input
                type="file"
                class="hidden"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onchange={handleIrFileChange}
                bind:this={irFileInput}
              />
            </label>
            <button
              onclick={submitIrUpload}
              disabled={!selectedIrFile || uploadingIr}
              class="px-4 py-2.5 text-[13px] font-semibold text-white bg-[linear-gradient(to_bottom,#0B182A,#021E44)] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 cursor-pointer"
            >
              {uploadingIr ? 'Uploading…' : 'Upload Incident Report'}
            </button>
          </div>

          <div class="border border-gray-200 rounded-2xl p-5 flex flex-col gap-4">
            <div>
              <h3 class="text-[14px] font-semibold text-[#0B182A]">Upload Site Images</h3>
              <p class="text-[12px] text-gray-400 mt-1">Accepted formats: JPG, PNG. Multiple images allowed.</p>
            </div>
            <label class="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#0B182A] hover:bg-gray-50 transition-colors">
              <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Icons.CloudUpload size={20} stroke="#6b7280" />
              </div>
              <div class="text-center">
                <p class="text-[13px] font-medium text-gray-700">Select site images</p>
                <p class="text-[11px] text-gray-400 mt-0.5">You can choose multiple files at once</p>
              </div>
              {#if selectedSiteFiles.length > 0}
                <div class="flex flex-wrap justify-center gap-2">
                  {#each selectedSiteFiles as file}
                    <span class="text-[12px] font-medium text-[#0B182A] bg-gray-100 px-3 py-1 rounded-full max-w-full truncate">
                      {file.name}
                    </span>
                  {/each}
                </div>
              {/if}
              <input
                type="file"
                class="hidden"
                accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                multiple
                onchange={handleSiteImageChange}
                bind:this={siteImageInput}
              />
            </label>
            <button
              onclick={submitSiteImages}
              disabled={selectedSiteFiles.length === 0 || uploadingSiteImages}
              class="px-4 py-2.5 text-[13px] font-semibold text-white bg-[#E87D1F] rounded-lg hover:bg-[#d06a10] transition-colors disabled:opacity-60 cursor-pointer"
            >
              {uploadingSiteImages ? 'Uploading…' : 'Upload Site Images'}
            </button>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-1 border-t border-gray-100">
          <button onclick={() => (uploadTicket = null)} class="px-5 py-2.5 text-[13px] text-gray-600 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors cursor-pointer">
            Done
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- ── Replacement Status Tracker Modal ───────────────────────────────────── -->
{#if trackerTicket}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    role="presentation"
    onclick={() => (trackerTicket = null)}
  >
    <div
      class="bg-white rounded-2xl w-full max-w-sm shadow-2xl"
      role="dialog"
      aria-modal="true"
      aria-label="Replacement Status"
      onclick={(e) => e.stopPropagation()}
    >
      <div class="flex items-start justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <p class="text-[11px] font-semibold text-[#E87D1F] mb-0.5">
            {trackerTicket.ticketNumber || trackerTicket.id.slice(0, 8)}
          </p>
          <h2 class="text-[15px] font-semibold text-[#0B182A]">Replacement Status</h2>
        </div>
        <button onclick={() => (trackerTicket = null)} class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors shrink-0" aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div class="px-6 py-5">
        {#if trackerLoading}
          <div class="flex items-center justify-center gap-2 py-8 text-[13px] text-gray-400">
            <div class="w-4 h-4 border-2 border-gray-200 border-t-fuchsia-500 rounded-full animate-spin"></div>
            Loading…
          </div>
        {:else if !trackerData}
          <p class="text-[13px] text-gray-400 py-6 text-center">No replacement data found</p>
        {:else}
          <!-- Device info -->
          <div class="flex items-center gap-3 p-3 rounded-xl bg-fuchsia-50 mb-5">
            <Icons.Cube size={18} stroke="#a21caf" />
            <div>
              <p class="text-[13px] font-semibold text-fuchsia-800">{trackerData.deviceType}</p>
              <p class="text-[11px] text-fuchsia-600 mt-0.5 line-clamp-2">{trackerData.reason}</p>
            </div>
          </div>

          <!-- Timeline -->
          {@const STEPS = ['pending', 'approved', 'dispatched', 'replaced'] as const}
          {@const LABELS = { pending: 'Requested', approved: 'Approved', dispatched: 'Dispatched', replaced: 'Replaced' }}
          {@const currentIdx = STEPS.indexOf((trackerData.status ?? 'pending') as typeof STEPS[number])}
          <div class="flex flex-col gap-0">
            {#each STEPS as step, i}
              {@const done = i <= currentIdx && trackerData.status !== 'rejected'}
              {@const active = i === currentIdx && trackerData.status !== 'rejected'}
              <div class="flex gap-3 {i < STEPS.length - 1 ? 'pb-4' : ''}">
                <div class="flex flex-col items-center">
                  <div class="w-7 h-7 rounded-full flex items-center justify-center border-2 shrink-0
                               {done ? 'bg-fuchsia-600 border-fuchsia-600' : 'bg-white border-gray-200'}">
                    {#if done}
                      <Icons.Check size={12} stroke="white" />
                    {:else}
                      <span class="w-2 h-2 rounded-full bg-gray-300"></span>
                    {/if}
                  </div>
                  {#if i < STEPS.length - 1}
                    <div class="w-0.5 flex-1 mt-1 {done ? 'bg-fuchsia-300' : 'bg-gray-200'}"></div>
                  {/if}
                </div>
                <div class="pt-0.5 pb-2">
                  <p class="text-[13px] font-semibold {active ? 'text-fuchsia-700' : done ? 'text-gray-700' : 'text-gray-400'}">
                    {LABELS[step]}
                  </p>
                  {#if step === 'approved' && trackerData.poNumber}
                    <p class="text-[11px] text-gray-400 mt-0.5">PO: {trackerData.poNumber}</p>
                  {/if}
                </div>
              </div>
            {/each}
            {#if trackerData.status === 'rejected'}
              <div class="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-red-50 border border-red-100">
                <Icons.XSquare size={14} stroke="#dc2626" />
                <p class="text-[12px] text-red-600 font-medium">Request rejected</p>
              </div>
            {/if}
          </div>
        {/if}
      </div>

      <div class="flex justify-end px-6 pb-5">
        <button onclick={() => (trackerTicket = null)} class="px-5 py-2.5 text-[13px] text-gray-600 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors cursor-pointer">
          Close
        </button>
      </div>
    </div>
  </div>
{/if}
