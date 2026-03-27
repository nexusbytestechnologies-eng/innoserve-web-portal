<script lang="ts">
  import * as Icons from "$lib/icons";

  let {
    mode = "add",
    data = null,
    onSave,
    onClose,
  }: {
    mode?: "add" | "edit";
    data?: Record<string, string> | null;
    onSave: (form: Record<string, string>) => void;
    onClose: () => void;
  } = $props();

  let form = $state({
    issue: data?.issue ?? "",
    sub: data?.sub ?? "",
    sla: data?.sla ?? "On Track",
    place: data?.place ?? "",
    engineer: data?.engineer ?? "",
    status: data?.status ?? "Open",
    priority: data?.priority ?? "Medium",
    date:
      data?.date ?? new Date().toLocaleDateString("en-GB").replace(/\//g, "/"),
  });

  let errors = $state<Record<string, string>>({});

  function validate() {
    errors = {};
    if (!form.issue.trim()) errors.issue = "Issue is required";
    if (!form.sub.trim()) errors.sub = "Customer / Subscriber is required";
    if (!form.place.trim()) errors.place = "Place / State is required";
    if (!form.engineer.trim()) errors.engineer = "Engineer name is required";
    if (!form.date.trim()) errors.date = "Date is required";
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
  <!-- svelte-ignore a11y_interactive_supports_focus -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div
    class="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col"
    role="dialog"
    aria-modal="true"
    aria-label={mode === "add" ? "Create Ticket" : "Edit Ticket"}
    onclick={(e) => e.stopPropagation()}
  >
    <!-- Header -->
    <div
      class="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0"
    >
      <div>
        <h2 class="text-[16px] font-semibold text-[#0B182A]">
          {mode === "add" ? "Create Ticket" : "Edit Ticket"}
        </h2>
        <p class="text-[12px] text-gray-400 mt-0.5">
          {mode === "add"
            ? "Fill in the details to raise a new ticket"
            : "Update the ticket information below"}
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
      <!-- Issue -->
      <label class={labelClass}>
        <span class={labelTextClass}
          >Issue / Title <span class="text-red-400">*</span></span
        >
        <input
          type="text"
          placeholder="e.g. Database Error"
          class={fieldClass}
          bind:value={form.issue}
        />
        {#if errors.issue}<span class={errorClass}>{errors.issue}</span>{/if}
      </label>

      <!-- Customer / Sub -->
      <label class={labelClass}>
        <span class={labelTextClass}
          >Customer / Subscriber <span class="text-red-400">*</span></span
        >
        <input
          type="text"
          placeholder="e.g. SBI Bank"
          class={fieldClass}
          bind:value={form.sub}
        />
        {#if errors.sub}<span class={errorClass}>{errors.sub}</span>{/if}
      </label>

      <!-- Row: SLA + Priority -->
      <div class="grid grid-cols-2 gap-4">
        <label class={labelClass}>
          <span class={labelTextClass}>SLA Status</span>
          <select class={fieldClass} bind:value={form.sla}>
            <option value="On Track">On Track</option>
            <option value="Breached">Breached</option>
          </select>
        </label>
        <label class={labelClass}>
          <span class={labelTextClass}>Priority</span>
          <select class={fieldClass} bind:value={form.priority}>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </label>
      </div>

      <!-- Row: Status + Date -->
      <div class="grid grid-cols-2 gap-4">
        <label class={labelClass}>
          <span class={labelTextClass}>Status</span>
          <select class={fieldClass} bind:value={form.status}>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Closed">Closed</option>
          </select>
        </label>
        <label class={labelClass}>
          <span class={labelTextClass}
            >Date <span class="text-red-400">*</span></span
          >
          <input
            type="text"
            placeholder="DD/MM/YYYY"
            class={fieldClass}
            bind:value={form.date}
          />
          {#if errors.date}<span class={errorClass}>{errors.date}</span>{/if}
        </label>
      </div>

      <!-- Place -->
      <label class={labelClass}>
        <span class={labelTextClass}
          >Place / State <span class="text-red-400">*</span></span
        >
        <input
          type="text"
          placeholder="e.g. Kerala"
          class={fieldClass}
          bind:value={form.place}
        />
        {#if errors.place}<span class={errorClass}>{errors.place}</span>{/if}
      </label>

      <!-- Engineer -->
      <label class={labelClass}>
        <span class={labelTextClass}
          >Assigned Engineer <span class="text-red-400">*</span></span
        >
        <input
          type="text"
          placeholder="e.g. Arun"
          class={fieldClass}
          bind:value={form.engineer}
        />
        {#if errors.engineer}<span class={errorClass}>{errors.engineer}</span
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
          class="px-5 py-2.5 text-[13px] text-white font-semibold bg-[linear-gradient(to_bottom,#0B182A,#021E44)] rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
        >
          {mode === "add" ? "Create Ticket" : "Save Changes"}
        </button>
      </div>
    </form>
  </div>
</div>
