<script lang="ts">
  import { onMount } from "svelte";
  import * as Icons from "$lib/icons";
  import { fetchEngineerProfiles, type EngineerProfile } from "./queries";
  import { updateEngineerDocumentsStatus } from "./actions";
  import { toast } from "svelte-sonner";
  import ConfirmModal from "$lib/components/ConfirmModal.svelte";
  import EngineerDocumentsModal from "./EngineerDocumentsModal.svelte";
  import AdminAddEngineerModal from "./AdminAddEngineerModal.svelte";
  interface Props {
    canDelete?: boolean;
  }

  let { canDelete = true }: Props = $props();

  let engineers = $state<EngineerProfile[]>([]);
  let loading = $state(true);
  let showAddEngineerModal = $state(false);

  let pendingCount = $derived(engineers.filter(e => e.documentsStatus === "pending").length);
  let approvedCount = $derived(engineers.filter(e => e.documentsStatus === "approved").length);

  // Documents review modal
  let reviewEng = $state<EngineerProfile | null>(null);

  // Confirmation modal state
  let confirmModal = $state<{
    title: string;
    message: string;
    confirmLabel: string;
    confirmClass: string;
    action: () => Promise<void>;
  } | null>(null);

  onMount(async () => {
    try {
      engineers = await fetchEngineerProfiles();
    } catch (err) {
      toast.error("Failed to load engineers");
    } finally {
      loading = false;
    }
  });

  function promptApprove(eng: EngineerProfile) {
    reviewEng = null;
    confirmModal = {
      title: "Approve Engineer",
      message: `Approve ${eng.userName ?? eng.referenceId ?? "this engineer"}? Login credentials will be sent to their email.`,
      confirmLabel: "Approve",
      confirmClass: "bg-green-600 text-white hover:bg-green-700",
      action: async () => {
        const updated = await updateEngineerDocumentsStatus({ id: eng.id, documentsStatus: "approved" });
        engineers = engineers.map(e => e.id === updated.id ? { ...e, ...updated } : e);
        toast.success(`${eng.userName ?? eng.referenceId} approved — credentials sent`);
      },
    };
  }

  function promptReject(eng: EngineerProfile) {
    reviewEng = null;
    confirmModal = {
      title: "Reject Engineer",
      message: `Reject ${eng.userName ?? eng.referenceId ?? "this engineer"}? This cannot be undone.`,
      confirmLabel: "Reject",
      confirmClass: "bg-red-500 text-white hover:bg-red-600",
      action: async () => {
        const updated = await updateEngineerDocumentsStatus({ id: eng.id, documentsStatus: "rejected" });
        engineers = engineers.map(e => e.id === updated.id ? { ...e, ...updated } : e);
        toast.success(`${eng.userName ?? eng.referenceId} rejected`);
      },
    };
  }

  async function handleConfirm() {
    if (!confirmModal) return;
    const action = confirmModal.action;
    confirmModal = null;
    try {
      await action();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  function statusStyle(status: string) {
    if (status === "approved") return "bg-green-50 text-green-600";
    if (status === "pending") return "bg-amber-50 text-amber-600";
    if (status === "rejected") return "bg-red-50 text-red-500";
    if (status === "reupload") return "bg-purple-50 text-purple-600";
    return "bg-gray-100 text-gray-500";
  }

  function location(eng: EngineerProfile): string {
    return [eng.addressCity, eng.addressState].filter(Boolean).join(", ") || "—";
  }
</script>

<div class="flex flex-col gap-5" data-can-delete={canDelete}>
  <!-- Stat Pills -->
  <div class="flex gap-3 flex-wrap">
    <div class="bg-white rounded-xl px-5 py-3 shadow flex items-center gap-3">
      <Icons.Users size={18} stroke="#0B182A" />
      <span class="text-[13px] text-gray-500">Total</span>
      <span class="text-[15px] font-bold text-[#0B182A]">{engineers.length}</span>
    </div>
    <div class="bg-white rounded-xl px-5 py-3 shadow flex items-center gap-3">
      <Icons.UserCheck size={18} stroke="#22c55e" />
      <span class="text-[13px] text-gray-500">Approved</span>
      <span class="text-[15px] font-bold text-green-600">{approvedCount}</span>
    </div>
    <div class="bg-white rounded-xl px-5 py-3 shadow flex items-center gap-3">
      <Icons.UserX size={18} stroke="#E87D1F" />
      <span class="text-[13px] text-gray-500">Pending</span>
      <span class="text-[15px] font-bold text-amber-600">{pendingCount}</span>
    </div>
    {#if canDelete}
      <button
        onclick={() => (showAddEngineerModal = true)}
        class="bg-[linear-gradient(to_bottom,#0B182A,#021E44)] rounded-xl px-5 py-3 shadow flex items-center gap-3 text-white cursor-pointer hover:opacity-95 transition-opacity"
      >
        <Icons.UserPlus size={18} stroke="currentColor" />
        <span class="text-[13px] font-semibold">Add Engineer</span>
      </button>
    {/if}
  </div>

  <!-- Filter Bar -->
  <div class="flex items-center gap-3 flex-wrap bg-white rounded-xl px-5 py-4 shadow">
    <div class="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg flex-1 max-w-100">
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
  </div>

  <!-- Engineer Cards Grid -->
  {#if loading}
    <div class="text-center py-16 text-[13px] text-gray-400">Loading…</div>
  {:else if engineers.length === 0}
    <div class="text-center py-16 text-[13px] text-gray-400">No engineers yet</div>
  {:else}
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {#each engineers as eng}
        <div class="bg-white rounded-2xl p-5 border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <!-- Card Header -->
          <div class="flex justify-between items-start mb-3">
            <div class="flex flex-col">
              <h4 class="text-[15px] font-semibold text-[#0B182A]">{eng.userName ?? "—"}</h4>
              <p class="text-[12px] text-[#E87D1F] font-medium mt-px">{eng.referenceId ?? eng.id}</p>
            </div>
            <span class="text-[11px] font-semibold px-2.5 py-1 rounded-full {statusStyle(eng.documentsStatus)}">
              {eng.documentsStatus}
            </span>
          </div>

          <!-- Details -->
          <div class="flex flex-col gap-1.5 mb-4">
            {#if eng.userEmail}
              <span class="flex items-center gap-1.5 text-[12px] text-gray-500">
                <Icons.Search size={12} stroke="#9ca3af" />
                {eng.userEmail}
              </span>
            {/if}
            <span class="flex items-center gap-1.5 text-[12px] text-gray-500">
              <Icons.MapPin size={12} stroke="#9ca3af" />
              {location(eng)}
            </span>
          </div>

          <!-- Footer: review documents or meta info -->
          <div class="pt-3.5 border-t border-gray-100">
            {#if eng.documentsStatus === "pending"}
              <button
                onclick={() => (reviewEng = eng)}
                class="w-full py-2 text-[12px] font-semibold rounded-lg bg-[#0B182A] text-white hover:opacity-90 transition-opacity cursor-pointer"
              >
                Review Documents
              </button>
            {:else}
              <div class="flex items-center justify-between text-[12px] text-gray-400">
                <span>{eng.addressState ?? "—"}</span>
                <span class="text-gray-300">{eng.createdAt ? new Date(eng.createdAt).toLocaleDateString() : ""}</span>
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Footer -->
  <div class="bg-white rounded-xl px-6 py-4 shadow text-[13px] text-gray-500">
    Showing <strong>{engineers.length}</strong> engineers
  </div>
</div>

{#if reviewEng}
  {@const eng = reviewEng}
  <EngineerDocumentsModal
    {eng}
    onApprove={() => promptApprove(eng)}
    onReject={() => promptReject(eng)}
    onClose={() => (reviewEng = null)}
  />
{/if}

{#if confirmModal}
  <ConfirmModal
    title={confirmModal.title}
    message={confirmModal.message}
    confirmLabel={confirmModal.confirmLabel}
    confirmClass={confirmModal.confirmClass}
    onConfirm={handleConfirm}
    onCancel={() => (confirmModal = null)}
  />
{/if}

{#if showAddEngineerModal}
  <AdminAddEngineerModal onClose={() => (showAddEngineerModal = false)} />
{/if}
