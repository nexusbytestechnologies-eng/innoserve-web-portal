<script lang="ts">
  import { restRequest } from "$lib/api/rest";
  import { queryVersion } from "$lib/stores/query";
  import { toast } from "svelte-sonner";
  import * as Icons from "$lib/icons";
  import InventoryForm from "./InventoryForm.svelte";
  import AddStockForm from "./AddStockForm.svelte";
  import { createInventoryItem, updateInventoryItem, type InventoryItem } from "./actions";

  let items = $state<InventoryItem[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);

  async function fetchInventory() {
    loading = true;
    error = null;
    try {
      items = await restRequest<InventoryItem[]>("/api/inventory");
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    $queryVersion.inventory;
    fetchInventory();
  });

  let showForm = $state(false);
  let formMode = $state<"add" | "edit">("add");
  let editData = $state<InventoryItem | null>(null);
  let saving = $state(false);
  let stockItem = $state<InventoryItem | null>(null);

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

  async function handleSave(form: Record<string, unknown>) {
    saving = true;
    try {
      if (formMode === "add") {
        await createInventoryItem({
          name: form.name as string,
          sku: form.sku as string,
          quantity: form.quantity as number,
          location: form.location as string,
        });
        toast.success("Item added");
      } else if (editData) {
        await updateInventoryItem({
          id: editData.id,
          name: form.name as string,
          sku: form.sku as string,
          quantity: form.quantity as number,
          location: form.location as string,
        });
        toast.success("Item updated");
      }
      showForm = false;
    } catch (e) {
      toast.error((e as Error).message ?? "Something went wrong");
    } finally {
      saving = false;
    }
  }
</script>

<div class="flex flex-col gap-5">
  <!-- Filter Bar -->
  <div class="flex items-center gap-3 flex-wrap bg-white rounded-xl px-5 py-4 shadow">
    <div class="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg flex-1 max-w-100">
      <Icons.Search size={16} stroke="#9ca3af" />
      <input type="text" placeholder="Search" class="text-[13px] outline-none border-none w-full text-gray-600 placeholder:text-gray-400" />
    </div>

    <button
      onclick={openAdd}
      class="ml-auto flex items-center gap-1.5 px-4 py-2.5 bg-[#E87D1F] hover:bg-[#E87D1F]/90 text-white text-[13px] font-semibold rounded-lg cursor-pointer border-none transition-colors duration-150"
    >
      <Icons.Plus size={14} strokeWidth={2.5} />
      Add Item
    </button>
  </div>

  <!-- Table Card -->
  <div class="bg-white rounded-2xl p-6 shadow">
    <div class="flex justify-between items-center mb-4">
      <div class="flex items-center gap-3">
        <h3 class="text-[18px] font-semibold text-[#0B182A]">All Inventory</h3>
        {#if !loading}
          <span class="text-[12px] text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{items.length} Total</span>
        {/if}
      </div>
      <button class="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-[13px] text-gray-600 bg-white cursor-pointer hover:border-[#0B182A] transition-colors duration-150">
        <Icons.Download size={14} />
        Export
      </button>
    </div>

    <div class="overflow-x-auto">
      {#if loading}
        <div class="flex items-center justify-center py-16 text-gray-400 text-[13px]">Loading…</div>
      {:else if error}
        <div class="flex items-center justify-center py-16 text-red-500 text-[13px]">{error}</div>
      {:else}
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="border-b border-gray-100">
              {#each ["NAME", "SKU", "QUANTITY", "LOCATION", "ACTIONS"] as col}
                <th class="text-left text-[11px] font-semibold text-gray-400 tracking-wide py-3 px-3 whitespace-nowrap">{col}</th>
              {/each}
            </tr>
          </thead>
          <tbody>
            {#each items as item}
              <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td class="py-3 px-3 text-[13px] text-gray-700 font-medium">{item.name}</td>
                <td class="py-3 px-3 text-[13px] text-[#E87D1F] font-medium">{item.sku}</td>
                <td class="py-3 px-3 text-[13px] text-gray-600">{item.quantity}</td>
                <td class="py-3 px-3 text-[13px] text-gray-600">{item.location}</td>
                <td class="py-3 px-3">
                  <div class="flex gap-1">
                    <button
                      aria-label="Add stock"
                      onclick={() => (stockItem = item)}
                      class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-[#0B182A] bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <Icons.Plus size={13} strokeWidth={2.5} />
                      Add Stock
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

        {#if items.length === 0}
          <div class="flex items-center justify-center py-16 text-gray-400 text-[13px]">No inventory items found.</div>
        {/if}
      {/if}
    </div>

    {#if !loading && !error && items.length > 0}
      <div class="flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
        <span class="text-[13px] text-gray-500">Showing <strong>1–{items.length}</strong> of {items.length} items</span>
      </div>
    {/if}
  </div>
</div>

{#if showForm}
  <InventoryForm
    mode={formMode}
    data={editData}
    {saving}
    onSave={handleSave}
    onClose={() => (showForm = false)}
  />
{/if}

{#if stockItem}
  <AddStockForm
    item={stockItem}
    onClose={() => (stockItem = null)}
  />
{/if}
