<script lang="ts">
  import * as Icons from "$lib/icons";

  let {
    mode = "add",
    data = null,
    onSave,
    onClose,
  }: {
    mode?: "add" | "edit";
    data?: Record<string, unknown> | null;
    onSave: (form: Record<string, unknown>) => void;
    onClose: () => void;
  } = $props();

  let form = $state({
    name: (data?.name as string) ?? "",
    category: (data?.category as string) ?? "Networking",
    qty: String(data?.qty ?? ""),
    location: (data?.location as string) ?? "",
    assigned: (data?.assigned as string) ?? "",
    status: (data?.status as string) ?? "Active",
  });

  let errors = $state<Record<string, string>>({});

  function validate() {
    errors = {};
    if (!form.name.trim()) errors.name = "Item name is required";
    if (!form.qty.trim() || isNaN(Number(form.qty)) || Number(form.qty) < 0)
      errors.qty = "Enter a valid quantity";
    if (!form.location.trim()) errors.location = "Location is required";
    return Object.keys(errors).length === 0;
  }

  function handleSubmit(e: Event) {
    e.preventDefault();
    if (!validate()) return;
    onSave({ ...form, qty: Number(form.qty) });
  }

  const fieldClass =
    "px-3.5 py-2.5 border border-gray-200 rounded-lg text-[13px] text-gray-700 outline-none focus:border-[#0B182A] transition-colors w-full bg-white";
  const labelClass = "flex flex-col gap-1.5";
  const labelTextClass = "text-[11px] font-semibold text-gray-500 uppercase tracking-wide";
  const errorClass = "text-[11px] text-red-500 mt-0.5";
</script>

<!-- Backdrop -->
<div
  class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
  role="presentation"
  onclick={onClose}
>
  <!-- Modal -->
  <div
    class="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col"
    role="dialog"
    aria-modal="true"
    aria-label={mode === "add" ? "Add Inventory Item" : "Edit Inventory Item"}
    onclick={(e) => e.stopPropagation()}
  >
    <!-- Header -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
      <div>
        <h2 class="text-[16px] font-semibold text-[#0B182A]">
          {mode === "add" ? "Add Inventory Item" : "Edit Inventory Item"}
        </h2>
        <p class="text-[12px] text-gray-400 mt-0.5">
          {mode === "add" ? "Add a new item to the inventory" : "Update the item details below"}
        </p>
      </div>
      <button
        onclick={onClose}
        class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
        aria-label="Close"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <!-- Body -->
    <form class="px-6 py-5 flex flex-col gap-4 overflow-y-auto" onsubmit={handleSubmit}>
      <!-- Item Name -->
      <label class={labelClass}>
        <span class={labelTextClass}>Item Name <span class="text-red-400">*</span></span>
        <input
          type="text"
          placeholder="e.g. Router"
          class={fieldClass}
          bind:value={form.name}
        />
        {#if errors.name}<span class={errorClass}>{errors.name}</span>{/if}
      </label>

      <!-- Row: Category + Quantity -->
      <div class="grid grid-cols-2 gap-4">
        <label class={labelClass}>
          <span class={labelTextClass}>Category</span>
          <select class={fieldClass} bind:value={form.category}>
            <option value="Networking">Networking</option>
            <option value="Storage">Storage</option>
            <option value="Power">Power</option>
            <option value="Cable">Cable</option>
            <option value="Tools">Tools</option>
          </select>
        </label>
        <label class={labelClass}>
          <span class={labelTextClass}>Quantity <span class="text-red-400">*</span></span>
          <input
            type="number"
            min="0"
            placeholder="0"
            class={fieldClass}
            bind:value={form.qty}
          />
          {#if errors.qty}<span class={errorClass}>{errors.qty}</span>{/if}
        </label>
      </div>

      <!-- Location -->
      <label class={labelClass}>
        <span class={labelTextClass}>Location / State <span class="text-red-400">*</span></span>
        <input
          type="text"
          placeholder="e.g. Kerala"
          class={fieldClass}
          bind:value={form.location}
        />
        {#if errors.location}<span class={errorClass}>{errors.location}</span>{/if}
      </label>

      <!-- Row: Assigned To + Status -->
      <div class="grid grid-cols-2 gap-4">
        <label class={labelClass}>
          <span class={labelTextClass}>Assigned To</span>
          <input
            type="text"
            placeholder="e.g. Arun (optional)"
            class={fieldClass}
            bind:value={form.assigned}
          />
        </label>
        <label class={labelClass}>
          <span class={labelTextClass}>Status</span>
          <select class={fieldClass} bind:value={form.status}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </label>
      </div>

      <!-- Footer -->
      <div class="flex justify-end gap-3 pt-2 border-t border-gray-100 mt-1">
        <button
          type="button"
          onclick={onClose}
          class="px-5 py-2.5 text-[13px] text-gray-600 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="px-5 py-2.5 text-[13px] text-white font-semibold bg-[#E87D1F] hover:bg-[#d06a10] rounded-lg transition-colors cursor-pointer"
        >
          {mode === "add" ? "Add Item" : "Save Changes"}
        </button>
      </div>
    </form>
  </div>
</div>
