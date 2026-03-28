<script lang="ts">
  import { onMount } from 'svelte';
  import * as Icons from '$lib/icons';
  import { toast } from 'svelte-sonner';
  import { fetchProjects, type Project } from '$lib/modules/data/projects/queries';
  import { createProject } from '$lib/modules/data/projects/actions';
  import { fetchCustomers, type Customer } from '$lib/modules/data/customers/queries';
  import { fetchEngineerProfiles, type EngineerProfile } from '$lib/modules/data/engineers/queries';

  // ── State ──────────────────────────────────────────────────────────────────

  let projects = $state<Project[]>([]);
  let customers = $state<Customer[]>([]);
  let engineers = $state<EngineerProfile[]>([]);
  let loading = $state(true);

  // Modal state
  let showModal = $state(false);
  let submitting = $state(false);
  let form = $state({ name: '', customerId: '', projectHeadId: '' });
  let errors = $state<Record<string, string>>({});

  // ── Derived helpers ────────────────────────────────────────────────────────

  function customerName(id: string): string {
    return customers.find((c) => c.id === id)?.companyName ?? id ?? '—';
  }

  function headName(id: string | null | undefined): string {
    if (!id) return '—';
    const eng = engineers.find((e) => e.userId === id || e.id === id);
    return eng?.userName ?? id;
  }

  // ── Load data ──────────────────────────────────────────────────────────────

  onMount(async () => {
    try {
      [projects, customers, engineers] = await Promise.all([
        fetchProjects(),
        fetchCustomers(),
        fetchEngineerProfiles(),
      ]);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      loading = false;
    }
  });

  // ── Form ───────────────────────────────────────────────────────────────────

  function openModal() {
    form = { name: '', customerId: '', projectHeadId: '' };
    errors = {};
    showModal = true;
  }

  function validate(): boolean {
    errors = {};
    if (!form.name.trim()) errors.name = 'Project name is required';
    if (!form.customerId) errors.customerId = 'Please select a customer';
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!validate()) return;
    submitting = true;
    try {
      const created = await createProject({
        name: form.name.trim(),
        customerId: form.customerId,
        projectHeadId: form.projectHeadId || undefined,
        author: 'admin',
      });
      projects = [created, ...projects];
      toast.success('Project created successfully');
      showModal = false;
    } catch (err) {
      toast.error(`Failed to create project: ${(err as Error).message}`);
    } finally {
      submitting = false;
    }
  }

  const fieldClass =
    'px-3.5 py-2.5 border border-gray-200 rounded-lg text-[13px] text-gray-700 outline-none focus:border-[#0B182A] transition-colors w-full bg-white';
  const labelClass = 'flex flex-col gap-1.5';
  const labelTextClass = 'text-[11px] font-semibold text-gray-500 uppercase tracking-wide';
  const errorClass = 'text-[11px] text-red-500 mt-0.5';
</script>

<svelte:head><title>Projects · Admin · Innoserve Techsol</title></svelte:head>

<div class="flex flex-col gap-5">

  <!-- Filter / Action bar -->
  <div class="flex items-center gap-3 flex-wrap bg-white rounded-xl px-5 py-4 shadow">
    <div class="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg flex-1 max-w-xs">
      <Icons.Search size={16} stroke="#9ca3af" />
      <input
        type="text"
        placeholder="Search projects…"
        class="text-[13px] outline-none border-none w-full text-gray-600 placeholder:text-gray-400"
      />
    </div>

    <button
      onclick={openModal}
      class="flex items-center gap-1.5 px-4 py-2.5 bg-[linear-gradient(to_bottom,#0B182A,#021E44)] hover:opacity-90 text-white text-[13px] font-semibold rounded-lg cursor-pointer border-none transition-opacity ml-auto"
    >
      <Icons.Plus size={14} strokeWidth={2.5} />
      Add Project
    </button>
  </div>

  <!-- Table -->
  <div class="bg-white rounded-2xl p-6 shadow">
    <div class="flex items-center gap-3 mb-4">
      <h3 class="text-[18px] font-semibold text-[#0B182A]">All Projects</h3>
      <span class="text-[12px] text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{projects.length} Total</span>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-sm border-collapse">
        <thead>
          <tr class="border-b border-gray-100">
            {#each ['PROJECT NAME', 'CUSTOMER', 'PROJECT HEAD', 'CREATED'] as col}
              <th class="text-left text-[11px] font-semibold text-gray-400 tracking-wide py-3 px-3 whitespace-nowrap">{col}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#if loading}
            <tr>
              <td colspan="4" class="py-10 text-center text-[13px] text-gray-400">Loading…</td>
            </tr>
          {:else if projects.length === 0}
            <tr>
              <td colspan="4" class="py-10 text-center text-[13px] text-gray-400">No projects yet</td>
            </tr>
          {:else}
            {#each projects as p}
              <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td class="py-3 px-3 text-[13px] font-medium text-[#0B182A]">{p.name}</td>
                <td class="py-3 px-3 text-[13px] text-[#E87D1F] font-medium">{customerName(p.customerId)}</td>
                <td class="py-3 px-3 text-[13px] text-gray-600">{headName(p.projectHeadId)}</td>
                <td class="py-3 px-3 text-[12px] text-gray-400">
                  {new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </div>
</div>

<!-- Create Project Modal -->
{#if showModal}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    role="presentation"
    onclick={() => (showModal = false)}
  >
    <div
      class="bg-white rounded-2xl w-full max-w-md shadow-2xl"
      role="dialog"
      aria-modal="true"
      aria-label="Add Project"
      onclick={(e) => e.stopPropagation()}
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <h2 class="text-[16px] font-semibold text-[#0B182A]">Add Project</h2>
          <p class="text-[12px] text-gray-400 mt-0.5">Create a new project and assign a project head</p>
        </div>
        <button
          onclick={() => (showModal = false)}
          class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- Form -->
      <form class="px-6 py-5 flex flex-col gap-4" onsubmit={handleSubmit}>
        <!-- Project Name -->
        <label class={labelClass}>
          <span class={labelTextClass}>Project Name <span class="text-red-400">*</span></span>
          <input
            type="text"
            placeholder="e.g. ATM Deployment"
            class={fieldClass}
            bind:value={form.name}
          />
          {#if errors.name}<span class={errorClass}>{errors.name}</span>{/if}
        </label>

        <!-- Customer dropdown -->
        <label class={labelClass}>
          <span class={labelTextClass}>Customer <span class="text-red-400">*</span></span>
          <select class={fieldClass} bind:value={form.customerId}>
            <option value="">— Select customer —</option>
            {#each customers.filter(c => c.status === 'active') as c}
              <option value={c.id}>{c.companyName}</option>
            {/each}
          </select>
          {#if errors.customerId}<span class={errorClass}>{errors.customerId}</span>{/if}
        </label>

        <!-- Project Head dropdown -->
        <label class={labelClass}>
          <span class={labelTextClass}>Project Head</span>
          <select class={fieldClass} bind:value={form.projectHeadId}>
            <option value="">— Assign later —</option>
            {#each engineers as eng}
              <option value={eng.userId}>{eng.userName ?? eng.userEmail ?? eng.userId}</option>
            {/each}
          </select>
        </label>

        <!-- Footer -->
        <div class="flex justify-end gap-3 pt-2 border-t border-gray-100 mt-1">
          <button
            type="button"
            onclick={() => (showModal = false)}
            class="px-5 py-2.5 text-[13px] text-gray-600 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            class="px-5 py-2.5 text-[13px] text-white font-semibold bg-[linear-gradient(to_bottom,#0B182A,#021E44)] rounded-lg hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-60"
          >
            {submitting ? 'Creating…' : 'Add Project'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
