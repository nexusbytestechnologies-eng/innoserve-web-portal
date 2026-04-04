<script lang="ts">
  import { untrack } from "svelte";

  interface InventoryFormData {
    name?: string;
    sku?: string;
    quantity?: number;
    location?: string;
  }

  let {
    mode = "add",
    data = null,
    saving = false,
    onSave,
    onClose,
  }: {
    mode?: "add" | "edit";
    data?: InventoryFormData | null;
    saving?: boolean;
    onSave: (form: Record<string, unknown>) => void;
    onClose: () => void;
  } = $props();

  let form = $state({
    name: untrack(() => data?.name ?? ""),
    sku: untrack(() => data?.sku ?? ""),
    quantity: untrack(() => String(data?.quantity ?? "")),
    location: untrack(() => data?.location ?? ""),
  });

  let errors = $state<Record<string, string>>({});

  function validate() {
    errors = {};
    if (!form.name.trim()) errors.name = "Item name is required";
    if (!form.sku.trim()) errors.sku = "SKU is required";
    else if (!/^[A-Za-z0-9\-_]+$/.test(form.sku.trim()))
      errors.sku =
        "SKU must contain only letters, numbers, hyphens or underscores";
    const qty = form.quantity.trim();
    if (!qty) errors.quantity = "Quantity is required";
    else if (!/^\d+$/.test(qty))
      errors.quantity = "Quantity must be a whole number";
    else if (Number(qty) < 0) errors.quantity = "Quantity cannot be negative";
    if (!form.location.trim()) errors.location = "Location is required";
    return Object.keys(errors).length === 0;
  }

  function handleSubmit(e: Event) {
    e.preventDefault();
    if (!validate()) return;
    onSave({ ...form, quantity: Number(form.quantity) });
  }

  const fieldClass =
    "px-3.5 py-2.5 border border-gray-200 rounded-lg text-[13px] text-gray-700 outline-none focus:border-[#0B182A] transition-colors w-full bg-white";
  const labelClass = "flex flex-col gap-1.5";
  const labelTextClass =
    "text-[11px] font-semibold text-gray-500 uppercase tracking-wide";
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
    tabindex="-1"
    aria-modal="true"
    aria-label={mode === "add" ? "Add Inventory Item" : "Edit Inventory Item"}
    onclick={(e) => e.stopPropagation()}
    onkeydown={(e) => e.stopPropagation()}
  >
    <!-- Header -->
    <div
      class="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0"
    >
      <div>
        <h2 class="text-[16px] font-semibold text-[#0B182A]">
          {mode === "add" ? "Add Inventory Item" : "Edit Inventory Item"}
        </h2>
        <p class="text-[12px] text-gray-400 mt-0.5">
          {mode === "add"
            ? "Add a new item to the inventory"
            : "Update the item details below"}
        </p>
      </div>
      <button
        onclick={onClose}
        class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
        aria-label="Close"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" /><line
            x1="6"
            y1="6"
            x2="18"
            y2="18"
          />
        </svg>
      </button>
    </div>

    <!-- Body -->
    <form
      class="px-6 py-5 flex flex-col gap-4 overflow-y-auto"
      onsubmit={handleSubmit}
    >
      <!-- Item Name -->
      <label class={labelClass}>
        <span class={labelTextClass}
          >Item Name <span class="text-red-400">*</span></span
        >
        <input
          type="text"
          placeholder="e.g. Router"
          class="{fieldClass} {errors.name
            ? 'border-red-400 focus:border-red-400'
            : ''}"
          bind:value={form.name}
        />
        {#if errors.name}<span class={errorClass}>{errors.name}</span>{/if}
      </label>

      <!-- Row: SKU + Quantity -->
      <div class="grid grid-cols-2 gap-4">
        <label class={labelClass}>
          <span class={labelTextClass}
            >SKU <span class="text-red-400">*</span></span
          >
          <input
            type="text"
            placeholder="e.g. SKU-001"
            class="{fieldClass} {errors.sku
              ? 'border-red-400 focus:border-red-400'
              : ''}"
            bind:value={form.sku}
          />
          {#if errors.sku}<span class={errorClass}>{errors.sku}</span>{/if}
        </label>
        <label class={labelClass}>
          <span class={labelTextClass}
            >Quantity <span class="text-red-400">*</span></span
          >
          <input
            type="text"
            inputmode="numeric"
            min="0"
            step="1"
            placeholder="0"
            class="{fieldClass} {errors.quantity
              ? 'border-red-400 focus:border-red-400'
              : ''}"
            bind:value={form.quantity}
            oninput={(e) => {
              const el = e.target as HTMLInputElement;
              el.value = el.value.replace(/\D/g, "");
              form.quantity = el.value;
            }}
          />
          {#if errors.quantity}<span class={errorClass}>{errors.quantity}</span
            >{/if}
        </label>
      </div>

      <!-- Location -->
      <label class={labelClass}>
        <span class={labelTextClass}
          >Location <span class="text-red-400">*</span></span
        >
        <input
          type="text"
          placeholder="e.g. Kerala"
          class="{fieldClass} {errors.location
            ? 'border-red-400 focus:border-red-400'
            : ''}"
          bind:value={form.location}
        />
        {#if errors.location}<span class={errorClass}>{errors.location}</span
          >{/if}
      </label>

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
          disabled={saving}
          class="px-5 py-2.5 text-[13px] text-white font-semibold bg-[#E87D1F] hover:bg-[#d06a10] rounded-lg transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? "Saving…" : mode === "add" ? "Add Item" : "Save Changes"}
        </button>
      </div>
    </form>
  </div>
</div>
