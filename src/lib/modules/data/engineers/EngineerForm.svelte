<script lang="ts">
  import { untrack } from "svelte";
  import type { EngineerProfile } from "./queries";

  let {
    data = null,
    onSave,
    onClose,
  }: {
    data?: EngineerProfile | null;
    onSave: (form: Record<string, string>) => void;
    onClose: () => void;
  } = $props();

  let form = $state(untrack(() => ({
    userName:          data?.userName          ?? "",
    userPhone:         data?.userPhone         ?? "",
    addressState:      data?.addressState      ?? "",
    addressCity:       data?.addressCity       ?? "",
    addressPincode:    data?.addressPincode    ?? "",
    assignedState:     data?.assignedState     ?? "",
    bankAccountNumber: data?.bankAccountNumber ?? "",
    ifscCode:          data?.ifscCode          ?? "",
    accountHolderName: data?.accountHolderName ?? "",
  })));

  let errors = $state<Record<string, string>>({});

  function validate() {
    errors = {};
    if (!form.userName.trim()) errors.userName = "Full name is required";
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
  const sectionClass = "text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 mt-1";
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
    aria-label="Edit Engineer"
    onclick={(e) => e.stopPropagation()}
  >
    <!-- Header -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
      <div>
        <h2 class="text-[16px] font-semibold text-[#0B182A]">Edit Engineer</h2>
        <p class="text-[12px] text-gray-400 mt-0.5">Update the engineer's profile details</p>
      </div>
      <button
        onclick={onClose}
        class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 cursor-pointer"
        aria-label="Close"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <!-- Body -->
    <form class="px-6 py-5 flex flex-col gap-4 overflow-y-auto" onsubmit={handleSubmit}>

      <!-- Personal -->
      <p class={sectionClass}>Personal Info</p>
      <div class="grid grid-cols-2 gap-4">
        <label class="{labelClass} col-span-2">
          <span class={labelTextClass}>Full Name <span class="text-red-400">*</span></span>
          <input type="text" placeholder="e.g. Rajesh Kumar" class={fieldClass} bind:value={form.userName} />
          {#if errors.userName}<span class={errorClass}>{errors.userName}</span>{/if}
        </label>
        <label class={labelClass}>
          <span class={labelTextClass}>Phone</span>
          <input type="tel" placeholder="e.g. 9876543210" class={fieldClass} bind:value={form.userPhone} />
        </label>
      </div>

      <!-- Address -->
      <p class={sectionClass}>Address</p>
      <div class="grid grid-cols-2 gap-4">
        <label class={labelClass}>
          <span class={labelTextClass}>State</span>
          <input type="text" placeholder="e.g. Maharashtra" class={fieldClass} bind:value={form.addressState}
            oninput={(e) => { const el = e.target as HTMLInputElement; el.value = el.value.replace(/[^A-Za-z\s.\-']/g, ""); form.addressState = el.value; }} />
        </label>
        <label class={labelClass}>
          <span class={labelTextClass}>City</span>
          <input type="text" placeholder="e.g. Mumbai" class={fieldClass} bind:value={form.addressCity}
            oninput={(e) => { const el = e.target as HTMLInputElement; el.value = el.value.replace(/[^A-Za-z\s.\-']/g, ""); form.addressCity = el.value; }} />
        </label>
        <label class={labelClass}>
          <span class={labelTextClass}>Pincode</span>
          <input type="text" placeholder="e.g. 400001" class={fieldClass} bind:value={form.addressPincode} />
        </label>
        <label class={labelClass}>
          <span class={labelTextClass}>Assigned State</span>
          <input type="text" placeholder="e.g. Maharashtra" class={fieldClass} bind:value={form.assignedState}
            oninput={(e) => { const el = e.target as HTMLInputElement; el.value = el.value.replace(/[^A-Za-z\s.\-']/g, ""); form.assignedState = el.value; }} />
        </label>
      </div>

      <!-- Bank -->
      <p class={sectionClass}>Bank Details</p>
      <div class="grid grid-cols-2 gap-4">
        <label class="{labelClass} col-span-2">
          <span class={labelTextClass}>Account Holder Name</span>
          <input type="text" placeholder="e.g. Rajesh Kumar" class={fieldClass} bind:value={form.accountHolderName} />
        </label>
        <label class={labelClass}>
          <span class={labelTextClass}>Account Number</span>
          <input type="text" placeholder="e.g. 1234567890" class={fieldClass} bind:value={form.bankAccountNumber} />
        </label>
        <label class={labelClass}>
          <span class={labelTextClass}>IFSC Code</span>
          <input type="text" placeholder="e.g. SBIN0001234" class={fieldClass} bind:value={form.ifscCode} />
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
          class="px-5 py-2.5 text-[13px] text-white font-semibold bg-[linear-gradient(to_bottom,#0B182A,#021E44)] hover:opacity-90 rounded-lg transition-opacity cursor-pointer"
        >
          Save Changes
        </button>
      </div>
    </form>
  </div>
</div>
