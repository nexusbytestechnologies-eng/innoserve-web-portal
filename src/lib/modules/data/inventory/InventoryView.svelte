<script lang="ts">
  import * as Icons from "$lib/icons";
  import InventoryForm from "./InventoryForm.svelte";

  type InventoryItem = {
    id: string;
    name: string;
    category: string;
    qty: number;
    location: string;
    assigned: string;
    status: string;
  };

  const inventoryStats = [
    { label: "Total Items", value: "240", trend: "+16%", trendDir: "up", color: "#0B182A" },
    { label: "Available Stock", value: "198", trend: "+8%", trendDir: "up", color: "#22c55e" },
    { label: "Assigned Items", value: "42", trend: "+11%", trendDir: "up", color: "#f59e0b" },
    { label: "Low Stock Items", value: "1,250", trend: "-8%", trendDir: "down", color: "#ef4444" },
  ];

  let items = $state<InventoryItem[]>([
    { id: "INV001", name: "Router", category: "Networking", qty: 45, location: "Kerala", assigned: "Arun", status: "Active" },
    { id: "INV002", name: "Hard Drive", category: "Storage", qty: 12, location: "Tamil Nadu", assigned: "Rahul", status: "Inactive" },
    { id: "INV003", name: "UPS Battery", category: "Power", qty: 8, location: "Delhi", assigned: "Manoj", status: "Active" },
    { id: "INV004", name: "IP Camera", category: "Networking", qty: 20, location: "Karnataka", assigned: "Suresh", status: "Inactive" },
    { id: "INV005", name: "Laptop", category: "Cable", qty: 34, location: "Maharashtra", assigned: "— Unassigned —", status: "Active" },
    { id: "INV006", name: "Network Switch", category: "Tools", qty: 47, location: "Gujarat", assigned: "Vikram", status: "Active" },
    { id: "INV007", name: "Network Switch", category: "Tools", qty: 47, location: "Gujarat", assigned: "Vikram", status: "Active" },
    { id: "INV008", name: "Network Switch", category: "Tools", qty: 47, location: "Gujarat", assigned: "Vikram", status: "Active" },
  ]);

  let showForm = $state(false);
  let formMode = $state<"add" | "edit">("add");
  let editData = $state<InventoryItem | null>(null);

  function openAdd() {
    formMode = "add";
    editData = null;
    showForm = true;
  }

  function openEdit(item: InventoryItem) {
    formMode = "edit";
    editData = { ...item };
    showForm = true;
  }

  function handleSave(form: Record<string, unknown>) {
    if (formMode === "add") {
      const newId = `INV${String(items.length + 1).padStart(3, "0")}`;
      items = [
        ...items,
        {
          id: newId,
          name: form.name as string,
          category: form.category as string,
          qty: form.qty as number,
          location: form.location as string,
          assigned: (form.assigned as string) || "— Unassigned —",
          status: form.status as string,
        },
      ];
    } else if (editData) {
      items = items.map((i) =>
        i.id === editData!.id
          ? {
              ...i,
              name: form.name as string,
              category: form.category as string,
              qty: form.qty as number,
              location: form.location as string,
              assigned: (form.assigned as string) || "— Unassigned —",
              status: form.status as string,
            }
          : i
      );
    }
    showForm = false;
  }
</script>

<div class="flex flex-col gap-5">
  <!-- Stat Cards -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
    {#each inventoryStats as stat}
      <div class="bg-white rounded-2xl border border-gray-100 relative overflow-hidden
                  flex items-center gap-4 px-4 py-3.5
                  md:flex-col md:items-start md:gap-2 md:p-5">
        <!-- Coloured accent strip — mobile only -->
        <div class="absolute top-0 left-0 bottom-0 w-1 md:hidden" style="background-color: {stat.color};"></div>
        <!-- Icon -->
        <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
             style="background-color: {stat.color}20;">
          <Icons.Cube size={20} stroke={stat.color} />
        </div>
        <!-- Value + label -->
        <div class="flex-1 min-w-0 md:flex-none">
          <div class="text-[21px] md:text-[26px] font-bold text-[#0B182A] leading-tight">{stat.value}</div>
          <div class="text-[12px] text-gray-500">{stat.label}</div>
        </div>
        <!-- Trend badge — inline on mobile, absolute on desktop -->
        <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0
                     md:absolute md:top-4 md:right-4
                     {stat.trendDir === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}">
          {stat.trend}
        </span>
      </div>
    {/each}
  </div>

  <!-- Filter Bar -->
  <div class="flex items-center gap-3 flex-wrap bg-white rounded-xl px-5 py-4 shadow">
    <div class="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg flex-1 max-w-100">
      <Icons.Search size={16} stroke="#9ca3af" />
      <input type="text" placeholder="Search" class="text-[13px] outline-none border-none w-full text-gray-600 placeholder:text-gray-400" />
    </div>

    <button class="flex items-center gap-1.5 p-3 border border-gray-200 rounded-lg text-[13px] text-gray-600 bg-white cursor-pointer hover:border-[#0B182A] transition-colors duration-150">
      <Icons.Cube size={14} />
      Category
      <Icons.ChevronDown size={12} />
    </button>

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
      class="flex items-center gap-1.5 px-4 py-2.5 bg-[#E87D1F] hover:bg-[#E87D1F]/90 text-white text-[13px] font-semibold rounded-lg cursor-pointer border-none transition-colors duration-150 ml-auto"
    >
      <Icons.Plus size={14} strokeWidth={2.5} />
      Add Item
    </button>
  </div>

  <!-- Table Card -->
  <div class="bg-white rounded-2xl p-6 shadow">
    <!-- Table Header -->
    <div class="flex justify-between items-center mb-4">
      <div class="flex items-center gap-3">
        <h3 class="text-[18px] font-semibold text-[#0B182A]">All Inventory</h3>
        <span class="text-[12px] text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{items.length} Total</span>
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
            {#each ["ITEM ID", "ITEM NAME", "CATEGORY", "QUANTITY", "LOCATION", "ASSIGNED TO", "STATUS", "ACTIONS"] as col}
              <th class="text-left text-[11px] font-semibold text-gray-400 tracking-wide py-3 px-3 whitespace-nowrap">{col}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each items as item}
            <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td class="py-3 px-3 text-[#E87D1F] font-medium text-[13px]">{item.id}</td>
              <td class="py-3 px-3 text-[13px] text-gray-700 font-medium">{item.name}</td>
              <td class="py-3 px-3 text-[13px] text-gray-600">{item.category}</td>
              <td class="py-3 px-3 text-[13px] text-gray-600">{item.qty}</td>
              <td class="py-3 px-3 text-[13px] text-gray-600">{item.location}</td>
              <td class="py-3 px-3 text-[13px] text-gray-600">{item.assigned}</td>
              <td class="py-3 px-3">
                <span class="text-[11px] font-semibold px-2.5 py-1 rounded-full {item.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}">
                  {item.status}
                </span>
              </td>
              <td class="py-3 px-3">
                <div class="flex gap-1">
                  <button aria-label="View item" class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#0B182A] hover:bg-gray-100 transition-colors">
                    <Icons.Eye size={16} />
                  </button>
                  <button
                    aria-label="Edit item"
                    onclick={() => openEdit(item)}
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
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-gray-100 mt-2 gap-3">
      <span class="text-[13px] text-gray-500">Showing <strong>1–{items.length}</strong> of {items.length} Items</span>
      <div class="flex items-center gap-1">
        {#each ["< Previous", "1", "2", "3", "48", "Next >"] as page}
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
  <InventoryForm
    mode={formMode}
    data={editData}
    onSave={handleSave}
    onClose={() => (showForm = false)}
  />
{/if}
