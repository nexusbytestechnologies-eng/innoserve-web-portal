<script lang="ts">
  import { onMount } from "svelte";
  import * as Icons from "$lib/icons";
  import TicketForm from "./TicketForm.svelte";
  import { fetchTickets, type Ticket } from "./queries";
  import { createTicket } from "./actions";
  import { assignTicket, updateTicketStatus } from "$lib/api/tickets";
  import { type TicketStatus } from "$lib/config/roles";
  import { fetchProjects, type Project } from "$lib/modules/data/projects/queries";
  import { ApiError } from "$lib/api/rest";
  import { toast } from "svelte-sonner";

  interface Props {
    canDelete?: boolean;
  }

  let { canDelete = true }: Props = $props();

  // ── view-model (keeps the shape TicketForm expects) ──────────────────────
  type TicketRow = {
    id: string;
    projectId: string;
    categoryId: string;
    issue: string;
    sub: string;
    sla: string;
    place: string;
    engineer: string;
    planner: string;
    status: string;
    priority: string;
    date: string;
  };

  function toRow(t: Ticket): TicketRow {
    return {
      id: t.ticketNumber || t.id,
      projectId: t.projectId ?? '',
      categoryId: t.categoryId ?? '',
      issue: t.title,
      sub: t.author ?? "—",
      sla: t.slaDeadline
        ? new Date(t.slaDeadline) < new Date() ? "Breached" : "On Track"
        : "On Track",
      place: t.state ?? "—",
      engineer: t.assignedEngineerId ?? "",
      planner: t.statePlannerId ?? "",
      status: t.status ?? "Open",
      priority: t.priority ?? "Medium",
      date: t.createdAt
        ? new Date(t.createdAt).toLocaleDateString("en-GB")
        : "—",
    };
  }

  let tickets = $state<TicketRow[]>([]);
  let projects = $state<Project[]>([]);
  let loading = $state(true);

  onMount(async () => {
    try {
      const [data, projs] = await Promise.all([
        fetchTickets(),
        fetchProjects().catch(() => [] as Project[]),
      ]);
      tickets = data.map(toRow);
      projects = projs;
    } catch (err) {
      toast.error("Failed to load tickets");
    } finally {
      loading = false;
    }
  });

  function projectName(id: string): string {
    if (!id) return '—';
    return projects.find((p) => p.id === id)?.name ?? '—';
  }

  let showForm = $state(false);
  let formMode = $state<"add" | "edit">("add");
  let editData = $state<TicketRow | null>(null);

  function openAdd() {
    formMode = "add";
    editData = null;
    showForm = true;
  }

  function openEdit(ticket: TicketRow) {
    formMode = "edit";
    editData = { ...ticket };
    showForm = true;
  }

  async function handleSave(form: Record<string, string>) {
    if (formMode === "add") {
      try {
        const created = await createTicket({
          projectId: form.projectId || undefined,
          categoryId: form.categoryId || undefined,
          title: form.issue,
          description: form.sub || undefined,
          priority: form.priority,
          state: form.place,
        });
        tickets = [...tickets, toRow(created)];
        toast.success("Ticket created successfully");
      } catch (err) {
        if (err instanceof ApiError && err.status === 422 && err.errors?.length) {
          toast.error(err.errors.map((field) => field.message).join(", "));
        } else if (err instanceof ApiError && err.status === 403) {
          toast.error('Invalid project access');
        } else {
          toast.error(`Failed to create ticket: ${(err as Error).message}`);
        }
        return;
      }
    } else if (editData) {
      try {
        const assignmentChanged =
          (form.engineer || '') !== (editData.engineer || '') ||
          (form.planner || '') !== (editData.planner || '');
        const statusChanged = (form.status || '') !== (editData.status || '');
        let updated: Ticket | null = null;

        if (assignmentChanged) {
          updated = await assignTicket(editData.id, {
            engineerId: form.engineer || undefined,
            statePlannerId: form.planner || undefined,
          });
        }

        if (statusChanged) {
          updated = await updateTicketStatus(
            editData.id,
            form.status as TicketStatus,
          );
        }

        if (!updated) {
          toast.success("No ticket changes to save");
          showForm = false;
          return;
        }
        tickets = tickets.map((t) => (t.id === editData!.id ? { ...t, ...toRow(updated) } : t));
        toast.success("Ticket updated");
      } catch (err) {
        toast.error(`Failed to update ticket: ${(err as Error).message}`);
        return;
      }
    }
    showForm = false;
  }
</script>

<div class="flex flex-col gap-5" data-can-delete={canDelete}>
  <!-- Filter Bar -->
  <div class="flex items-center gap-3 flex-wrap bg-white rounded-xl px-5 py-4 shadow">
    <!-- Search -->
    <div class="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg flex-1 max-w-95 p-3">
      <Icons.Search size={16} stroke="#9ca3af" />
      <input
        type="text"
        placeholder="Search"
        class="text-[13px] outline-none border-none w-full text-gray-600 placeholder:text-gray-400"
      />
    </div>

    <!-- Filter Dropdowns -->
    {#each [{ label: "Status", icon: "circle" }, { label: "SLA Priority", icon: "settings" }, { label: "State", icon: "map-pin" }, { label: "Assigned Agents", icon: "user" }] as f}
      <button class="flex items-center gap-1.5 p-3 border border-gray-200 rounded-lg text-[13px] text-gray-600 bg-white cursor-pointer hover:border-[#0B182A] transition-colors duration-150">
        {#if f.icon === "circle"}
          <Icons.Circle size={14} />
        {:else if f.icon === "settings"}
          <Icons.Settings size={14} />
        {:else if f.icon === "map-pin"}
          <Icons.MapPin size={14} />
        {:else if f.icon === "user"}
          <Icons.Person size={14} />
        {/if}
        {f.label}
        <Icons.ChevronDown size={12} />
      </button>
    {/each}

    <!-- Create Ticket -->
    <button
      onclick={openAdd}
      class="flex items-center gap-1.5 p-3 bg-[linear-gradient(to_bottom,#0B182A,#021E44)] hover:opacity-90 text-white text-[13px] font-semibold rounded-lg cursor-pointer border-none transition-opacity duration-150 ml-auto"
    >
      <Icons.Plus size={14} strokeWidth={2.5} />
      Create Ticket
    </button>
  </div>

  <!-- Tickets Table Card -->
  <div class="bg-white rounded-2xl p-6 shadow">
    <!-- Table Header -->
    <div class="flex justify-between items-center mb-4">
      <div class="flex items-center gap-3">
        <h3 class="text-[18px] font-semibold text-[#0B182A]">All Tickets</h3>
        <span class="text-[12px] text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{tickets.length} Total</span>
      </div>
      <div class="flex gap-2">
        <button class="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-[13px] text-gray-600 bg-white cursor-pointer hover:border-[#0B182A] transition-colors duration-150">
          <Icons.Grid size={14} />
          Columns
        </button>
        <button class="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-[13px] text-gray-600 bg-white cursor-pointer hover:border-[#0B182A] transition-colors duration-150">
          <Icons.Download size={14} />
          Export
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-sm border-collapse">
        <thead>
          <tr class="border-b border-gray-100">
            {#each ["TICKET ID", "PROJECT", "ISSUE", "SLA", "PLACE", "ENGINEER", "STATUS", "PRIORITY", "DATE", "ACTIONS"] as col}
              <th class="text-left text-[11px] font-semibold text-gray-400 tracking-wide py-3 px-3 whitespace-nowrap">{col}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#if loading}
            <tr><td colspan="10" class="py-10 text-center text-[13px] text-gray-400">Loading…</td></tr>
          {:else if tickets.length === 0}
            <tr><td colspan="10" class="py-10 text-center text-[13px] text-gray-400">No tickets yet</td></tr>
          {:else}
          {#each tickets as ticket}
            <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td class="py-3 px-3 text-accent font-medium text-[13px]">{ticket.id}</td>
              <td class="py-3 px-3 text-[13px] text-gray-600 whitespace-nowrap">{projectName(ticket.projectId)}</td>
              <td class="py-3 px-3">
                <div class="text-[13px] text-gray-700 font-medium">{ticket.issue}</div>
                <div class="text-[11px] text-gray-400">{ticket.sub}</div>
              </td>
              <td class="py-3 px-3">
                <span class="text-[11px] font-semibold px-2.5 py-1 rounded-full {ticket.sla === 'Breached' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}">
                  {ticket.sla}
                </span>
              </td>
              <td class="py-3 px-3 text-[13px] text-gray-600">{ticket.place}</td>
              <td class="py-3 px-3 text-[13px] text-gray-600">{ticket.engineer}</td>
              <td class="py-3 px-3">
                <span class="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">{ticket.status}</span>
              </td>
              <td class="py-3 px-3">
                <span class="text-[11px] font-semibold px-2.5 py-1 rounded-full {ticket.priority === 'High' ? 'bg-red-50 text-red-500' : ticket.priority === 'Medium' ? 'bg-amber-50 text-amber-500' : 'bg-green-50 text-green-600'}">
                  {ticket.priority}
                </span>
              </td>
              <td class="py-3 px-3 text-[13px] text-gray-600 whitespace-nowrap">{ticket.date}</td>
              <td class="py-3 px-3">
                <div class="flex gap-1">
                  <button aria-label="View ticket details" class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#0B182A] hover:bg-gray-100 transition-colors">
                    <Icons.Eye size={16} />
                  </button>
                  <button
                    aria-label="Edit ticket"
                    onclick={() => openEdit(ticket)}
                    class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#0B182A] hover:bg-gray-100 transition-colors"
                  >
                    <Icons.Edit size={16} />
                  </button>
                </div>
              </td>
            </tr>
          {/each}
          {/if}
        </tbody>
      </table>
    </div>

    <!-- Table Footer -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-border-light mt-2 gap-3">
      <span class="text-[13px] text-gray-500">Showing <strong>1–{tickets.length}</strong> of {tickets.length} Tickets</span>
      <div class="flex items-center gap-1">
        {#each ["< Previous", "1", "2", "3", "120", "Next >"] as page}
          <button
            disabled={page === "< Previous"}
            class="px-3 py-1.5 text-[12px] rounded-md border transition-colors
                   {page === '1' ? 'bg-[linear-gradient(to_bottom,#0B182A,#021E44)] text-white border-[#0B182A]' : 'bg-white text-gray-500 border-gray-200 hover:border-[#0B182A] hover:text-[#0B182A]'}
                   {page === '< Previous' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}">{page}</button>
        {/each}
      </div>
    </div>
  </div>
</div>

{#if showForm}
  <TicketForm
    mode={formMode}
    data={editData}
    onSave={handleSave}
    onClose={() => (showForm = false)}
  />
{/if}
