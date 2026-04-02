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
    onSave: (form: Record<string, string>) => Promise<void>;
    onClose: () => void;
  } = $props();

  let form = $state({
    company: data?.companyName ?? "",
    contact: data?.contactPersonName ?? "",
    email: data?.email ?? "",
    phone: data?.phone ?? "",
    addressState: data?.addressState ?? "",
    addressCity: data?.addressCity ?? "",
    addressPincode: data?.addressPincode ?? "",
    secondaryContactName: data?.secondaryContactName ?? "",
    secondaryContactEmail: data?.secondaryContactEmail ?? "",
    secondaryContactPhone: data?.secondaryContactPhone ?? "",
  });

  let errors = $state<Record<string, string>>({});
  let saving = $state(false);

  function validate() {
    errors = {};
    if (!form.company.trim()) errors.company = "Company name is required";
    if (!form.contact.trim()) errors.contact = "Contact person is required";
    if (!form.phone.trim()) errors.phone = "Phone number is required";
    else if (!/^\+?\d[\d\s\-]{7,}$/.test(form.phone))
      errors.phone = "Enter a valid phone number";
    if (!form.addressState.trim()) errors.addressState = "State is required";
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!validate() || saving) return;
    saving = true;
    try {
      await onSave({ ...form });
    } finally {
      saving = false;
    }
  }

  const fieldClass =
    "px-3.5 py-2.5 border border-gray-200 rounded-lg text-[13px] text-gray-700 outline-none focus:border-[#0B182A] focus:ring-2 focus:ring-[#0B182A]/10 transition-all w-full bg-white disabled:opacity-50 disabled:cursor-not-allowed";
  const labelClass = "flex flex-col gap-1.5";
  const labelTextClass =
    "text-[11px] font-semibold text-gray-500 uppercase tracking-wide";
  const errorClass = "text-[11px] text-red-500 mt-0.5";
</script>

<!-- Backdrop -->
<div
  class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]"
  role="presentation"
  onclick={saving ? undefined : onClose}
>
  <!-- Modal -->
  <div
    class="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col animate-in"
    role="dialog"
    aria-modal="true"
    aria-label={mode === "add" ? "Add Customer" : "Edit Customer"}
    onclick={(e) => e.stopPropagation()}
  >
    <!-- Header -->
    <div
      class="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0"
    >
      <div>
        <h2 class="text-[16px] font-semibold text-[#0B182A]">
          {mode === "add" ? "Add Customer" : "Edit Customer"}
        </h2>
        <p class="text-[12px] text-gray-400 mt-0.5">
          {mode === "add"
            ? "Register a new customer to the portal"
            : "Update the customer details below"}
        </p>
      </div>
      <button
        onclick={onClose}
        disabled={saving}
        class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 active:scale-95 transition-all text-gray-400 hover:text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
      <!-- Section: Primary Contact -->
      <p
        class="text-[11px] font-bold text-gray-400 uppercase tracking-widest -mb-1"
      >
        Primary Contact
      </p>

      <!-- Company Name -->
      <label class={labelClass}>
        <span class={labelTextClass}
          >Company Name <span class="text-red-400">*</span></span
        >
        <input
          type="text"
          placeholder="e.g. HDFC Bank"
          class="{fieldClass} {errors.company
            ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10'
            : ''}"
          bind:value={form.company}
          disabled={saving}
        />
        {#if errors.company}<span class={errorClass}>{errors.company}</span
          >{/if}
      </label>

      <!-- Contact Person -->
      <label class={labelClass}>
        <span class={labelTextClass}
          >Contact Person <span class="text-red-400">*</span></span
        >
        <input
          type="text"
          placeholder="e.g. Arun Kumar"
          class="{fieldClass} {errors.contact
            ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10'
            : ''}"
          bind:value={form.contact}
          disabled={saving}
        />
        {#if errors.contact}<span class={errorClass}>{errors.contact}</span
          >{/if}
      </label>

      <!-- Row: Email + Phone -->
      <div class="grid grid-cols-2 gap-4">
        <label class={labelClass}>
          <span class={labelTextClass}>Email</span>
          <input
            type="email"
            placeholder="e.g. arun@hdfc.com"
            class={fieldClass}
            bind:value={form.email}
            disabled={saving}
          />
        </label>
        <label class={labelClass}>
          <span class={labelTextClass}
            >Phone <span class="text-red-400">*</span></span
          >
          <input
            type="text"
            placeholder="+91 9999999999"
            class="{fieldClass} {errors.phone
              ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10'
              : ''}"
            bind:value={form.phone}
            disabled={saving}
          />
          {#if errors.phone}<span class={errorClass}>{errors.phone}</span>{/if}
        </label>
      </div>

      <!-- Section: Address -->
      <p
        class="text-[11px] font-bold text-gray-400 uppercase tracking-widest -mb-1"
      >
        Address
      </p>

      <!-- Row: State + City -->
      <div class="grid grid-cols-2 gap-4">
        <label class={labelClass}>
          <span class={labelTextClass}
            >State <span class="text-red-400">*</span></span
          >
          <input
            type="text"
            placeholder="e.g. Kerala"
            class="{fieldClass} {errors.addressState
              ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10'
              : ''}"
            bind:value={form.addressState}
            disabled={saving}
          />
          {#if errors.addressState}<span class={errorClass}
              >{errors.addressState}</span
            >{/if}
        </label>
        <label class={labelClass}>
          <span class={labelTextClass}>City</span>
          <input
            type="text"
            placeholder="e.g. Kochi"
            class={fieldClass}
            bind:value={form.addressCity}
            disabled={saving}
          />
        </label>
      </div>

      <!-- Pincode -->
      <label class={labelClass}>
        <span class={labelTextClass}>Pincode</span>
        <input
          type="text"
          placeholder="e.g. 682001"
          class={fieldClass}
          bind:value={form.addressPincode}
          disabled={saving}
        />
      </label>

      <!-- Section: Secondary Contact -->
      <p
        class="text-[11px] font-bold text-gray-400 uppercase tracking-widest -mb-1"
      >
        Secondary Contact <span class="normal-case font-normal">(optional)</span
        >
      </p>

      <label class={labelClass}>
        <span class={labelTextClass}>Name</span>
        <input
          type="text"
          placeholder="e.g. Priya Nair"
          class={fieldClass}
          bind:value={form.secondaryContactName}
          disabled={saving}
        />
      </label>

      <div class="grid grid-cols-2 gap-4">
        <label class={labelClass}>
          <span class={labelTextClass}>Email</span>
          <input
            type="email"
            placeholder="e.g. priya@hdfc.com"
            class={fieldClass}
            bind:value={form.secondaryContactEmail}
            disabled={saving}
          />
        </label>
        <label class={labelClass}>
          <span class={labelTextClass}>Phone</span>
          <input
            type="text"
            placeholder="+91 9999999999"
            class={fieldClass}
            bind:value={form.secondaryContactPhone}
            disabled={saving}
          />
        </label>
      </div>

      <!-- Footer -->
      <div class="flex justify-end gap-3 pt-2 border-t border-gray-100 mt-1">
        <button
          type="button"
          onclick={onClose}
          disabled={saving}
          class="px-5 py-2.5 text-[13px] text-gray-600 border border-gray-200 rounded-lg hover:border-gray-400 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          class="relative flex items-center justify-center gap-2 px-5 py-2.5 text-[13px] text-white font-semibold bg-[linear-gradient(to_bottom,#0B182A,#021E44)] rounded-lg
                 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer
                 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100
                 min-w-[120px]"
        >
          {#if saving}
            <!-- Spinner -->
            <svg
              class="animate-spin h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              ></path>
            </svg>
            {mode === "add" ? "Adding…" : "Saving…"}
          {:else}
            {mode === "add" ? "Add Customer" : "Save Changes"}
          {/if}
        </button>
      </div>
    </form>
  </div>
</div>

<style>
  .animate-in {
    animation: slideUp 0.18s ease-out both;
  }
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(12px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
</style>
