<script lang="ts">
  import { onMount } from "svelte";
  import * as Icons from "$lib/icons";
  import CustomerForm from "./CustomerForm.svelte";
  import { fetchCustomers, type Customer } from "./queries";
  import { createCustomer, updateCustomerStatus } from "./actions";
  import { toast } from "svelte-sonner";
  import ConfirmModal from "$lib/components/ConfirmModal.svelte";

  const customerStats = [
    { label: "Total Customers", value: "0", icon: "users", color: "#0B182A" },
    { label: "Active Customers", value: "0", icon: "active", color: "#22c55e" },
    { label: "Pending Approval", value: "0", icon: "inactive", color: "#E87D1F" },
    { label: "Open Tickets", value: "—", icon: "tickets", color: "#6366f1" },
  ];

  let customers = $state<Customer[]>([]);
  let loading = $state(true);

  onMount(async () => {
    try {
      customers = await fetchCustomers();
      customerStats[0].value = String(customers.length);
      customerStats[1].value = String(customers.filter(c => c.status === "active").length);
      customerStats[2].value = String(customers.filter(c => c.status === "pending_approval").length);
    } catch (err) {
      toast.error("Failed to load customers");
    } finally {
      loading = false;
    }
  });

  // Confirmation modal state
  let confirmModal = $state<{
    title: string;
    message: string;
    confirmLabel: string;
    confirmClass: string;
    action: () => Promise<void>;
  } | null>(null);

  function promptApprove(customer: Customer) {
    confirmModal = {
      title: "Approve Customer",
      message: `Approve ${customer.companyName}? Login credentials will be sent to their email.`,
      confirmLabel: "Approve",
      confirmClass: "bg-green-600 text-white hover:bg-green-700",
      action: async () => {
        const updated = await updateCustomerStatus({ id: customer.id, status: "active", approvedBy: "admin" });
        customers = customers.map(c => c.id === updated.id ? { ...c, ...updated } : c);
        toast.success(`${customer.companyName} approved — credentials sent`);
      },
    };
  }

  function promptReject(customer: Customer) {
    confirmModal = {
      title: "Reject Customer",
      message: `Reject ${customer.companyName}? This cannot be undone.`,
      confirmLabel: "Reject",
      confirmClass: "bg-red-500 text-white hover:bg-red-600",
      action: async () => {
        const updated = await updateCustomerStatus({ id: customer.id, status: "rejected" });
        customers = customers.map(c => c.id === updated.id ? { ...c, ...updated } : c);
        toast.success(`${customer.companyName} rejected`);
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
    if (status === "active") return "bg-green-50 text-green-600";
    if (status === "pending_approval") return "bg-amber-50 text-amber-600";
    if (status === "rejected") return "bg-red-50 text-red-500";
    return "bg-gray-100 text-gray-500";
  }

  let showForm = $state(false);
  let formMode = $state<"add" | "edit">("add");
  let editData = $state<Customer | null>(null);

  function openAdd() {
    formMode = "add";
    editData = null;
    showForm = true;
  }

  async function handleSave(form: Record<string, string>) {
    if (formMode === "add") {
      try {
        const created = await createCustomer({
          companyName: form.company,
          contactPersonName: form.contact,
          phone: form.phone,
          addressState: form.location,
          author: "admin",
        });
        customers = [...customers, created];
        toast.success("Customer created successfully");
      } catch (err) {
        toast.error(`Failed to create customer: ${(err as Error).message}`);
        return;
      }
    }
    showForm = false;
  }
</script>

<div class="flex flex-col gap-5">
  <!-- Stat Cards -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
    {#each customerStats as stat}
      <div class="bg-white rounded-2xl shadow border border-amber-50 relative overflow-hidden
                  flex items-center gap-4 px-4 py-3.5
                  md:flex-col md:items-start md:gap-1 md:p-5">
        <div class="absolute top-0 left-0 bottom-0 w-1 md:hidden" style="background-color: {stat.color};"></div>
        <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 md:mb-1"
             style="background-color: {stat.color}15;">
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
        <div class="flex-1 min-w-0 md:flex-none">
          <div class="text-[21px] md:text-[22px] font-bold text-[#0B182A] leading-tight">{stat.value}</div>
          <div class="text-[12px] md:text-[13px] text-gray-400">{stat.label}</div>
        </div>
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
            {#each ["COMPANY", "CONTACT PERSON", "EMAIL", "PHONE", "LOCATION", "STATUS", "ACTIONS"] as col}
              <th class="text-left text-[11px] font-semibold text-gray-400 tracking-wide py-3 px-3 whitespace-nowrap">{col}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#if loading}
            <tr><td colspan="7" class="py-10 text-center text-[13px] text-gray-400">Loading…</td></tr>
          {:else if customers.length === 0}
            <tr><td colspan="7" class="py-10 text-center text-[13px] text-gray-400">No customers yet</td></tr>
          {:else}
            {#each customers as c}
              <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td class="py-3 px-3 text-[#E87D1F] font-medium text-[13px]">{c.companyName}</td>
                <td class="py-3 px-3 text-[13px] text-gray-700">{c.contactPersonName}</td>
                <td class="py-3 px-3 text-[13px] text-gray-600">{c.email}</td>
                <td class="py-3 px-3 text-[13px] text-gray-600">{c.phone}</td>
                <td class="py-3 px-3 text-[13px] text-gray-600">{c.addressState ?? "—"}</td>
                <td class="py-3 px-3">
                  <span class="text-[11px] font-semibold px-2.5 py-1 rounded-full {statusStyle(c.status)}">
                    {c.status}
                  </span>
                </td>
                <td class="py-3 px-3">
                  <div class="flex gap-1">
                    {#if c.status === "pending_approval"}
                      <button
                        aria-label="Approve customer"
                        onclick={() => promptApprove(c)}
                        class="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors cursor-pointer"
                      >Approve</button>
                      <button
                        aria-label="Reject customer"
                        onclick={() => promptReject(c)}
                        class="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors cursor-pointer"
                      >Reject</button>
                    {:else}
                      <button aria-label="View customer" class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#0B182A] hover:bg-gray-100 transition-colors">
                        <Icons.Eye size={16} />
                      </button>
                    {/if}
                  </div>
                </td>
              </tr>
            {/each}
          {/if}
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
