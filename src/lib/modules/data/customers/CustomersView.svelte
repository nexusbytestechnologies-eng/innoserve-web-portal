<script lang="ts">
  import * as Icons from "$lib/icons";
  import CustomerForm from "./CustomerForm.svelte";

  type Customer = {
    id: string;
    company: string;
    contact: string;
    phone: string;
    location: string;
    tickets: number;
    status: string;
  };

  const customerStats = [
    { label: "Total Customers", value: "240", trend: "+10%", trendDir: "up", icon: "users", color: "#0B182A" },
    { label: "Active Customers", value: "198", trend: "+8%", trendDir: "up", icon: "active", color: "#22c55e" },
    { label: "Inactive Customers", value: "42", trend: "+5%", trendDir: "up", icon: "inactive", color: "#ef4444" },
    { label: "Open Tickets", value: "1,250", trend: "+11%", trendDir: "up", icon: "tickets", color: "#E87D1F" },
  ];

  let customers = $state<Customer[]>([
    { id: "CUS001", company: "HDFC Bank", contact: "Arun", phone: "+91 9999999999", location: "Kerala", tickets: 12, status: "Active" },
    { id: "CUS002", company: "SBI Bank", contact: "Anandhu", phone: "+91 9999999999", location: "Tamil Nadu", tickets: 8, status: "Inactive" },
    { id: "CUS003", company: "ICICI Bank", contact: "Akshay", phone: "+91 9999999999", location: "Delhi", tickets: 0, status: "Active" },
    { id: "CUS004", company: "Axis Bank", contact: "Jabbar", phone: "+91 9999999999", location: "Maharashtra", tickets: 15, status: "Inactive" },
    { id: "CUS005", company: "Kotak Bank", contact: "John", phone: "+91 9999999999", location: "Karnataka", tickets: 5, status: "Active" },
    { id: "CUS006", company: "Canara Bank", contact: "Shruthi", phone: "+91 9999999999", location: "Telangana", tickets: 3, status: "Active" },
  ]);

  let showForm = $state(false);
  let formMode = $state<"add" | "edit">("add");
  let editData = $state<Customer | null>(null);

  function openAdd() {
    formMode = "add";
    editData = null;
    showForm = true;
  }

  function openEdit(customer: Customer) {
    formMode = "edit";
    editData = { ...customer };
    showForm = true;
  }

  function handleSave(form: Record<string, string>) {
    if (formMode === "add") {
      const newId = `CUS${String(customers.length + 1).padStart(3, "0")}`;
      customers = [...customers, { id: newId, tickets: 0, ...form } as Customer];
    } else if (editData) {
      customers = customers.map((c) =>
        c.id === editData!.id ? { ...c, ...form } : c
      );
    }
    showForm = false;
  }
</script>

<div class="flex flex-col gap-5">
  <!-- Stat Cards -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    {#each customerStats as stat}
      <div class="bg-white rounded-2xl p-5 shadow border border-amber-50 flex flex-col gap-1 relative w-full">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center mb-1" style="background-color: {stat.color}15;">
          {#if stat.icon === "users"}
            <Icons.Users size={20} stroke={stat.color} />
          {:else if stat.icon === "active"}
            <Icons.UserCheck size={20} stroke={stat.color} />
          {:else if stat.icon === "inactive"}
            <Icons.UserX size={20} stroke={stat.color} />
          {:else}
            <Icons.TicketCard size={20} stroke={stat.color} />
          {/if}
        </div>
        <span class="absolute top-4 right-4 text-[11px] font-semibold px-2 py-0.5 rounded-full {stat.trendDir === 'up' ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'}">
          {stat.trend}
        </span>
        <div class="text-[22px] font-bold text-[#0B182A]">{stat.value}</div>
        <div class="text-[13px] text-gray-400">{stat.label}</div>
      </div>
    {/each}
  </div>

  <!-- Filter Bar -->
  <div class="flex items-center gap-3 flex-wrap bg-white rounded-xl px-5 py-4 shadow">
    <div class="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg flex-1 max-w-125">
      <Icons.Search size={16} stroke="#9ca3af" />
      <input type="text" placeholder="Search" class="text-[13px] outline-none border-none w-full text-gray-600 placeholder:text-gray-400" />
    </div>

    <button class="flex items-center gap-1.5 p-3 border border-gray-200 rounded-lg text-[13px] text-gray-600 bg-white cursor-pointer hover:border-[#0B182A] transition-colors duration-150">
      <Icons.Circle size={14} />
      Status
      <Icons.ChevronDown size={12} />
    </button>

    <button class="flex items-center gap-1.5 p-3 border border-gray-200 rounded-lg text-[13px] text-gray-600 bg-white cursor-pointer hover:border-[#0B182A] transition-colors duration-150">
      <Icons.MapPin size={14} />
      State
      <Icons.ChevronDown size={12} />
    </button>

    <button
      onclick={openAdd}
      class="flex items-center gap-1.5 p-3 bg-[linear-gradient(to_bottom,#0B182A,#021E44)] hover:opacity-90 text-white text-[13px] font-semibold rounded-lg cursor-pointer border-none transition-opacity duration-150 ml-auto"
    >
      <Icons.Plus size={14} strokeWidth={2.5} />
      Add Customer
    </button>
  </div>

  <!-- Table -->
  <div class="bg-white rounded-2xl p-6 shadow">
    <div class="flex justify-between items-center mb-4">
      <div class="flex items-center gap-3">
        <h3 class="text-[18px] font-semibold text-[#0B182A]">All Customers</h3>
        <span class="text-[12px] text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{customers.length} Total</span>
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

    <div class="overflow-x-auto">
      <table class="w-full text-sm border-collapse">
        <thead>
          <tr class="border-b border-gray-100">
            {#each ["CUSTOMER ID", "COMPANY NAME", "CONTACT PERSON", "PHONE", "LOCATION", "ACTIVE TICKETS", "STATUS", "ACTIONS"] as col}
              <th class="text-left text-[11px] font-semibold text-gray-400 tracking-wide py-3 px-3 whitespace-nowrap">{col}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each customers as c}
            <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td class="py-3 px-3 text-[#E87D1F] font-medium text-[13px]">{c.id}</td>
              <td class="py-3 px-3 text-[13px] text-gray-700">{c.company}</td>
              <td class="py-3 px-3 text-[13px] text-gray-600">{c.contact}</td>
              <td class="py-3 px-3 text-[13px] text-gray-600">{c.phone}</td>
              <td class="py-3 px-3 text-[13px] text-gray-600">{c.location}</td>
              <td class="py-3 px-3 text-[13px] text-gray-600">{c.tickets}</td>
              <td class="py-3 px-3">
                <span class="text-[11px] font-semibold px-2.5 py-1 rounded-full {c.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}">
                  {c.status}
                </span>
              </td>
              <td class="py-3 px-3">
                <div class="flex gap-1">
                  <button aria-label="View customer details" class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#0B182A] hover:bg-gray-100 transition-colors">
                    <Icons.Eye size={16} />
                  </button>
                  <button
                    aria-label="Edit customer"
                    onclick={() => openEdit(c)}
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

    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-gray-100 mt-2 gap-3">
      <span class="text-[13px] text-gray-500">Showing <strong>1–{customers.length}</strong> of {customers.length} Customers</span>
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
  <CustomerForm
    mode={formMode}
    data={editData}
    onSave={handleSave}
    onClose={() => (showForm = false)}
  />
{/if}
