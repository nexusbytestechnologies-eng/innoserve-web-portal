<script lang="ts">
  import { onMount } from 'svelte';
  import * as Icons from '$lib/icons';
  import { toast } from 'svelte-sonner';
  import { authStore } from '$lib/stores/auth';
  import { fetchTickets, type Ticket } from '$lib/modules/data/tickets/queries';
  import { updateTicket, createTicketHistory, createAttachment } from '$lib/modules/data/tickets/actions';
  import { uploadFile, fileUrl } from '$lib/api/upload';

  const user = $derived($authStore.user);

  // ── Constants ─────────────────────────────────────────────────────────────

  // Engineers can move to In Progress or Resolved only.
  // "Send for Validation" is a separate direct action (resolved → pending_validation).
  const ENGINEER_STATUSES = ['In Progress', 'Resolved'];
  const ESCALATION_LEVELS = ['L2', 'L3'] as const;

  const fieldClass =
    'px-3.5 py-2.5 border border-gray-200 rounded-lg text-[13px] text-gray-700 outline-none focus:border-[#0B182A] transition-colors w-full bg-white';

  // ── State ─────────────────────────────────────────────────────────────────

  let tickets = $state<Ticket[]>([]);
  let loading = $state(true);

  // Status update modal
  let statusTicket = $state<Ticket | null>(null);
  let newStatus = $state('');
  let remarks = $state('');
  let statusSaving = $state(false);

  // Escalation modal
  let escalateTicket = $state<Ticket | null>(null);
  let escalationLevel = $state<'L2' | 'L3' | ''>('');
  let escalationReason = $state('');
  let escalating = $state(false);

  // Upload proof modal
  let uploadTicket = $state<Ticket | null>(null);
  let fileInput = $state<HTMLInputElement | null>(null);
  let selectedFile = $state<File | null>(null);
  let uploading = $state(false);
  let uploadedUrl = $state('');

  // ── Load ──────────────────────────────────────────────────────────────────

  onMount(async () => {
    try {
      const all = await fetchTickets();
      tickets = user ? all.filter((t) => t.assignedEngineerId === user.id) : all;
    } catch (err) {
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

  // Can the engineer still act on this ticket?
  function canAct(ticket: Ticket): boolean {
    return !['Closed', 'Cancelled'].includes(ticket.status);
  }

  // ── Status update ─────────────────────────────────────────────────────────

  function openStatus(ticket: Ticket) {
    statusTicket = ticket;
    // Default to next logical status
    newStatus = ticket.status === 'Open' ? 'In Progress' : ticket.status;
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
      const updated = await updateTicket({ id: statusTicket.id, status: newStatus });
      tickets = tickets.map((t) => (t.id === updated.id ? { ...t, ...updated } : t));

      if (newStatus === 'Pending Validation') {
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
        status: 'Pending Validation',
        remarks: 'Sent for admin validation',
        author: user?.id ?? 'engineer',
      });
      const updated = await updateTicket({ id: ticket.id, status: 'Pending Validation' });
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
    escalateTicket = ticket;
    escalationLevel = ticket.escalationLevel as 'L2' | 'L3' | '' ?? '';
    escalationReason = '';
  }

  async function saveEscalation() {
    if (!escalateTicket || !escalationLevel) return;
    escalating = true;
    try {
      const updated = await updateTicket({
        id: escalateTicket.id,
        escalationLevel,
      });
      await createTicketHistory({
        ticketId: escalateTicket.id,
        status: escalateTicket.status,
        remarks: `Support requested: ${escalationLevel}${escalationReason.trim() ? ` — ${escalationReason.trim()}` : ''}`,
        author: user?.id ?? 'engineer',
      });
      tickets = tickets.map((t) => (t.id === updated.id ? { ...t, ...updated } : t));
      toast.success(`Support request sent (${escalationLevel})`);
      escalateTicket = null;
    } catch (err) {
      toast.error(`Failed: ${(err as Error).message}`);
    } finally {
      escalating = false;
    }
  }

  // ── Upload proof ──────────────────────────────────────────────────────────

  function openUpload(ticket: Ticket) {
    uploadTicket = ticket;
    selectedFile = null;
    uploadedUrl = '';
  }

  function handleFileChange(e: Event) {
    selectedFile = (e.currentTarget as HTMLInputElement).files?.[0] ?? null;
  }

  async function submitUpload() {
    if (!uploadTicket || !selectedFile) return;
    uploading = true;
    try {
      const fileId = await uploadFile(selectedFile);
      const url = fileUrl(fileId);
      await createAttachment({ ticketId: uploadTicket.id, type: 'proof', fileUrl: url, author: user?.id ?? 'engineer' });
      uploadedUrl = url;
      toast.success('Proof uploaded successfully');
    } catch (err) {
      toast.error(`Upload failed: ${(err as Error).message}`);
    } finally {
      uploading = false;
    }
  }
</script>

<svelte:head><title>My Tickets · Engineer · Innoserve Techsol</title></svelte:head>

<div class="flex flex-col gap-5">

  <!-- Stats -->
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
    {#each [
      { label: 'Open', value: tickets.filter(t => t.status === 'Open').length, color: 'text-blue-600' },
      { label: 'In Progress', value: tickets.filter(t => t.status === 'In Progress').length, color: 'text-amber-600' },
      { label: 'Pending Validation', value: tickets.filter(t => t.status === 'Pending Validation').length, color: 'text-purple-600' },
      { label: 'Resolved', value: tickets.filter(t => t.status === 'Resolved').length, color: 'text-green-600' },
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
                  <p class="text-[13px] text-gray-400">No tickets assigned to you yet</p>
                </div>
              </td>
            </tr>
          {:else}
            {#each tickets as t}
              <tr class="border-b border-gray-50 hover:bg-gray-50/60 transition-colors
                         {t.status === 'Pending Validation' ? 'bg-purple-50/20' : ''}">
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
                      <!-- Status update — only if not already closed/cancelled -->
                      <button
                        onclick={() => openStatus(t)}
                        class="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Icons.Edit size={12} />
                        Status
                      </button>

                      <!-- Upload proof -->
                      <button
                        onclick={() => openUpload(t)}
                        class="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Icons.Upload size={12} />
                        Proof
                      </button>

                      <!-- Send for Validation — only when resolved -->
                      {#if t.status === 'Resolved'}
                        <button
                          onclick={() => sendForValidation(t)}
                          disabled={sendingValidation === t.id}
                          title="Send ticket for admin validation"
                          class="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60"
                        >
                          <Icons.CheckCircle size={12} />
                          {sendingValidation === t.id ? 'Sending…' : 'Validate'}
                        </button>
                      {/if}

                      <!-- Request Support / Escalate -->
                      {#if !t.escalationLevel}
                        <button
                          onclick={() => openEscalate(t)}
                          class="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <Icons.AlertTriangle size={12} />
                          Support
                        </button>
                      {:else}
                        <!-- Already escalated — show level with option to change -->
                        <button
                          onclick={() => openEscalate(t)}
                          class="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg {escalationBadge(t.escalationLevel)} hover:opacity-80 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <Icons.AlertTriangle size={12} />
                          {t.escalationLevel}
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
                         ? s === 'Pending Validation'
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
                {s}
                {#if s === 'Pending Validation'}
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
{#if escalateTicket}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    role="presentation"
    onclick={() => (escalateTicket = null)}
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
            {escalateTicket.ticketNumber || escalateTicket.id.slice(0, 8)}
          </p>
          <h2 class="text-[15px] font-semibold text-[#0B182A]">Request Support</h2>
          <p class="text-[12px] text-gray-400 mt-0.5">Escalate this ticket to a higher support level</p>
        </div>
        <button onclick={() => (escalateTicket = null)} class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors shrink-0" aria-label="Close">
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
        <button onclick={() => (escalateTicket = null)} class="px-5 py-2.5 text-[13px] text-gray-600 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors cursor-pointer">
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

<!-- ── Upload Proof Modal ─────────────────────────────────────────────────── -->
{#if uploadTicket}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    role="presentation"
    onclick={() => (uploadTicket = null)}
  >
    <div
      class="bg-white rounded-2xl w-full max-w-sm shadow-2xl"
      role="dialog"
      aria-modal="true"
      aria-label="Upload Proof"
      onclick={(e) => e.stopPropagation()}
    >
      <div class="flex items-start justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <p class="text-[11px] font-semibold text-[#E87D1F] mb-0.5">
            {uploadTicket.ticketNumber || uploadTicket.id.slice(0, 8)}
          </p>
          <h2 class="text-[15px] font-semibold text-[#0B182A]">Upload Work Proof</h2>
        </div>
        <button onclick={() => (uploadTicket = null)} class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors shrink-0" aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div class="px-6 py-5">
        {#if uploadedUrl}
          <div class="flex flex-col items-center gap-3 py-4">
            <div class="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <p class="text-[13px] font-medium text-gray-700">File uploaded successfully</p>
            <a href={uploadedUrl} target="_blank" rel="noopener noreferrer" class="text-[12px] text-[#E87D1F] hover:underline flex items-center gap-1">
              <Icons.Eye size={13} /> View file
            </a>
          </div>
        {:else}
          <label class="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#0B182A] hover:bg-gray-50 transition-colors">
            <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <Icons.CloudUpload size={20} stroke="#6b7280" />
            </div>
            <div class="text-center">
              <p class="text-[13px] font-medium text-gray-700">Click to select a file</p>
              <p class="text-[11px] text-gray-400 mt-0.5">Images, PDFs, or documents</p>
            </div>
            {#if selectedFile}
              <span class="text-[12px] font-medium text-[#0B182A] bg-gray-100 px-3 py-1 rounded-full max-w-full truncate">
                {selectedFile.name}
              </span>
            {/if}
            <input type="file" class="hidden" accept="image/*,.pdf,.doc,.docx" onchange={handleFileChange} bind:this={fileInput} />
          </label>
        {/if}
      </div>

      {#if !uploadedUrl}
        <div class="flex justify-end gap-3 px-6 pb-5 border-t border-gray-100 pt-4">
          <button onclick={() => (uploadTicket = null)} class="px-5 py-2.5 text-[13px] text-gray-600 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors cursor-pointer">Cancel</button>
          <button
            onclick={submitUpload}
            disabled={!selectedFile || uploading}
            class="px-5 py-2.5 text-[13px] font-semibold text-white bg-[linear-gradient(to_bottom,#0B182A,#021E44)] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 cursor-pointer"
          >
            {uploading ? 'Uploading…' : 'Upload Proof'}
          </button>
        </div>
      {:else}
        <div class="flex justify-end px-6 pb-5">
          <button onclick={() => (uploadTicket = null)} class="px-5 py-2.5 text-[13px] font-semibold text-white bg-[linear-gradient(to_bottom,#0B182A,#021E44)] rounded-lg hover:opacity-90 transition-opacity cursor-pointer">Done</button>
        </div>
      {/if}
    </div>
  </div>
{/if}
