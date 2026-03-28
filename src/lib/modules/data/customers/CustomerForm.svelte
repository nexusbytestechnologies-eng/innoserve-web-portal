<script lang="ts">
  import * as Icons from "$lib/icons";
  import { type Customer } from "./queries";

  let {
    mode = "add",
    data = null,
    onSave,
    onClose,
  }: {
    mode?: "add" | "edit";
    data?: Customer | null;
    onSave: (form: Record<string, string>) => void;
    onClose: () => void;
  } = $props();

  let form = $state({
    company: data?.companyName ?? "",
    contact: data?.contactPersonName ?? "",
    phone: data?.phone ?? "",
    location: data?.addressState ?? "",
    status: data?.status ?? "Active",
  });

  let errors = $state<Record<string, string>>({});

  function validate() {
    errors = {};
    if (!form.company.trim()) errors.company = "Company name is required";
    if (!form.contact.trim()) errors.contact = "Contact person is required";
    if (!form.phone.trim()) errors.phone = "Phone number is required";
    else if (!/^\+?\d[\d\s\-]{7,}$/.test(form.phone)) errors.phone = "Enter a valid phone number";
    if (!form.location.trim()) errors.location = "Location is required";
    return Object.keys(errors).length === 0;
  }

  function handleSubmit(e: Event) {
    e.preventDefault();
    if (!validate()) return;
    onSave({ ...form });
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
    aria-label={mode === "add" ? "Add Customer" : "Edit Customer"}
    onclick={(e) => e.stopPropagation()}
  >
    <!-- Header -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
      <div>
        <h2 class="text-[16px] font-semibold text-[#0B182A]">
          {mode === "add" ? "Add Customer" : "Edit Customer"}
        </h2>
        <p class="text-[12px] text-gray-400 mt-0.5">
          {mode === "add" ? "Register a new customer to the portal" : "Update the customer details below"}
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
      <!-- Company Name -->
      <label class={labelClass}>
        <span class={labelTextClass}>Company Name <span class="text-red-400">*</span></span>
        <input
          type="text"
          placeholder="e.g. HDFC Bank"
          class={fieldClass}
          bind:value={form.company}
        />
        {#if errors.company}<span class={errorClass}>{errors.company}</span>{/if}
      </label>

      <!-- Contact Person -->
      <label class={labelClass}>
        <span class={labelTextClass}>Contact Person <span class="text-red-400">*</span></span>
        <input
          type="text"
          placeholder="e.g. Arun Kumar"
          class={fieldClass}
          bind:value={form.contact}
        />
        {#if errors.contact}<span class={errorClass}>{errors.contact}</span>{/if}
      </label>

      <!-- Row: Phone + Location -->
      <div class="grid grid-cols-2 gap-4">
        <label class={labelClass}>
          <span class={labelTextClass}>Phone Number <span class="text-red-400">*</span></span>
          <input
            type="text"
            placeholder="+91 9999999999"
            class={fieldClass}
            bind:value={form.phone}
          />
          {#if errors.phone}<span class={errorClass}>{errors.phone}</span>{/if}
        </label>
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
      </div>

      <!-- Status -->
      <label class={labelClass}>
        <span class={labelTextClass}>Status</span>
        <select class={fieldClass} bind:value={form.status}>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
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
          class="px-5 py-2.5 text-[13px] text-white font-semibold bg-[linear-gradient(to_bottom,#0B182A,#021E44)] rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
        >
          {mode === "add" ? "Add Customer" : "Save Changes"}
        </button>
      </div>
    </form>
  </div>
</div>
