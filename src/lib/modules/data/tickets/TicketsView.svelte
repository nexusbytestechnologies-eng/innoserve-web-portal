<script lang="ts">
  import * as Icons from "$lib/icons";
  import TicketForm from "./TicketForm.svelte";

  type Ticket = {
    id: string;
    issue: string;
    sub: string;
    sla: string;
    place: string;
    engineer: string;
    status: string;
    priority: string;
    date: string;
  };

  let tickets = $state<Ticket[]>([
    { id: "TKT001", issue: "Database Error", sub: "SBI Bank", sla: "Breached", place: "Kerala", engineer: "Arun", status: "Open", priority: "High", date: "12/03/2026" },
    { id: "TKT002", issue: "Network Device Failure", sub: "SBI Bank", sla: "On Track", place: "Tamil Nadu", engineer: "Anandhu", status: "Open", priority: "Medium", date: "12/03/2026" },
    { id: "TKT003", issue: "Software Crash", sub: "SBI Bank", sla: "On Track", place: "Maharashtra", engineer: "Akshay", status: "Open", priority: "Low", date: "12/03/2026" },
    { id: "TKT004", issue: "Database Error", sub: "SBI Bank", sla: "Breached", place: "Karnataka", engineer: "Jabbar", status: "Open", priority: "High", date: "12/03/2026" },
    { id: "TKT005", issue: "Database Error", sub: "SBI Bank", sla: "On Track", place: "Kerala", engineer: "John", status: "Open", priority: "Medium", date: "12/03/2026" },
    { id: "TKT006", issue: "Database Error", sub: "SBI Bank", sla: "On Track", place: "Kerala", engineer: "Shruthi", status: "Open", priority: "Low", date: "12/03/2026" },
    { id: "TKT007", issue: "Database Error", sub: "SBI Bank", sla: "On Track", place: "Delhi", engineer: "Basi", status: "Open", priority: "Medium", date: "12/03/2026" },
    { id: "TKT008", issue: "Database Error", sub: "SBI Bank", sla: "On Track", place: "Goa", engineer: "Kiran", status: "Open", priority: "Low", date: "12/03/2026" },
    { id: "TKT009", issue: "Database Error", sub: "SBI Bank", sla: "Breached", place: "Kerala", engineer: "Varun", status: "Open", priority: "High", date: "12/03/2026" },
  ]);

  let showForm = $state(false);
  let formMode = $state<"add" | "edit">("add");
  let editData = $state<Ticket | null>(null);

  function openAdd() {
    formMode = "add";
    editData = null;
    showForm = true;
  }

  function openEdit(ticket: Ticket) {
    formMode = "edit";
    editData = { ...ticket };
    showForm = true;
  }

  function handleSave(form: Record<string, string>) {
    if (formMode === "add") {
      const newId = `TKT${String(tickets.length + 1).padStart(3, "0")}`;
      tickets = [...tickets, { id: newId, ...form } as Ticket];
    } else if (editData) {
      tickets = tickets.map((t) => (t.id === editData!.id ? { ...t, ...form } : t));
    }
    showForm = false;
  }
</script>

<div class="flex flex-col gap-5">
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
            {#each ["TICKET ID", "ISSUE", "SLA", "PLACE", "ENGINEER", "STATUS", "PRIORITY", "DATE", "ACTIONS"] as col}
              <th class="text-left text-[11px] font-semibold text-gray-400 tracking-wide py-3 px-3 whitespace-nowrap">{col}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each tickets as ticket}
            <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td class="py-3 px-3 text-accent font-medium text-[13px]">{ticket.id}</td>
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
