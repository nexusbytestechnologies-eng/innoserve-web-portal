<script lang="ts">
  import { toast } from 'svelte-sonner';
  import { authStore } from '$lib/stores/auth';
  import { ApiError, restRequest } from '$lib/api/rest';

  // ── State ─────────────────────────────────────────────────────────────────

  const user = $derived($authStore.user);

  let currentPassword = $state('');
  let newPassword     = $state('');
  let confirmPwd      = $state('');
  let showCurrent     = $state(false);
  let showNew         = $state(false);
  let showConfirm     = $state(false);
  let errors          = $state<Record<string, string>>({});
  let submitting      = $state(false);
  let successMsg      = $state('');

  // ── Strength ──────────────────────────────────────────────────────────────

  const strengthChecks = $derived([
    { label: 'At least 8 characters',    pass: newPassword.length >= 8          },
    { label: 'One uppercase letter',      pass: /[A-Z]/.test(newPassword)        },
    { label: 'One number',                pass: /[0-9]/.test(newPassword)        },
    { label: 'Passwords match',           pass: !!newPassword && newPassword === confirmPwd },
  ]);

  const strengthScore = $derived(strengthChecks.filter(c => c.pass).length);

  // ── Validation ────────────────────────────────────────────────────────────

  function validate(): boolean {
    errors = {};
    if (!currentPassword) errors.currentPassword = 'Current password is required';
    if (!newPassword) {
      errors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(newPassword)) {
      errors.newPassword = 'Must contain at least one uppercase letter';
    } else if (!/[0-9]/.test(newPassword)) {
      errors.newPassword = 'Must contain at least one number';
    }
    if (!confirmPwd) {
      errors.confirmPwd = 'Please confirm your password';
    } else if (newPassword !== confirmPwd) {
      errors.confirmPwd = 'Passwords do not match';
    }
    return Object.keys(errors).length === 0;
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  async function handleChangePassword(e: Event) {
    e.preventDefault();
    if (!validate()) return;
    submitting = true;
    successMsg = '';
    try {
      await restRequest('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      successMsg      = 'Password changed successfully.';
      currentPassword = '';
      newPassword     = '';
      confirmPwd      = '';
      errors          = {};
      toast.success('Password changed successfully');
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        errors.currentPassword = 'Current password is incorrect';
      } else {
        toast.error(`Failed: ${(err as Error).message}`);
      }
    } finally {
      submitting = false;
    }
  }

  const inputClass = (hasError: boolean) =>
    `w-full py-3 px-4 pr-11 border rounded-lg text-[13px] text-gray-700 outline-none transition-colors bg-white
     ${hasError ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-[#0B182A]'}`;

  const labelTextClass = 'text-[11px] font-semibold text-gray-500 uppercase tracking-wide';
  const errorClass     = 'text-[11px] text-red-500';
</script>

<svelte:head><title>My Profile · Innoserve Techsol</title></svelte:head>

<div class="flex flex-col gap-5 max-w-2xl">

  <!-- Profile info card -->
  <div class="bg-white rounded-2xl p-6 shadow">
    <h2 class="text-[18px] font-semibold text-[#0B182A] mb-4">Profile</h2>
    <div class="flex items-center gap-4">
      <div class="w-14 h-14 rounded-full bg-[#E87D1F] flex items-center justify-center text-white text-[18px] font-bold shrink-0">
        {user?.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() ?? '?'}
      </div>
      <div>
        <p class="text-[16px] font-semibold text-[#0B182A]">{user?.name ?? '—'}</p>
        <p class="text-[13px] text-gray-400 mt-0.5">{user?.email ?? '—'}</p>
        <span class="inline-block mt-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#0B182A]/10 text-[#0B182A]">
          {user?.role?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) ?? '—'}
        </span>
      </div>
    </div>
  </div>

  <!-- Change Password card -->
  <div class="bg-white rounded-2xl p-6 shadow">
    <h3 class="text-[16px] font-semibold text-[#0B182A] mb-1">Change Password</h3>
    <p class="text-[13px] text-gray-400 mb-6">Update your password. You'll stay logged in after changing it.</p>

    {#if successMsg}
      <div class="mb-5 flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 border border-green-200">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        <p class="text-[13px] text-green-700 font-medium">{successMsg}</p>
      </div>
    {/if}

    <form onsubmit={handleChangePassword} class="flex flex-col gap-4" novalidate>

      <!-- Current Password -->
      <div class="flex flex-col gap-1.5">
        <label for="current-pw" class={labelTextClass}>Current Password</label>
        <div class="relative">
          <input
            id="current-pw"
            type={showCurrent ? 'text' : 'password'}
            placeholder="Your current password"
            autocomplete="current-password"
            class={inputClass(!!errors.currentPassword)}
            bind:value={currentPassword}
          />
          <button
            type="button"
            onclick={() => (showCurrent = !showCurrent)}
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={showCurrent ? 'Hide' : 'Show'}
          >
            {#if showCurrent}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            {:else}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            {/if}
          </button>
        </div>
        {#if errors.currentPassword}<span class={errorClass}>{errors.currentPassword}</span>{/if}
      </div>

      <!-- New Password -->
      <div class="flex flex-col gap-1.5">
        <label for="new-pw" class={labelTextClass}>New Password</label>
        <div class="relative">
          <input
            id="new-pw"
            type={showNew ? 'text' : 'password'}
            placeholder="New password"
            autocomplete="new-password"
            class={inputClass(!!errors.newPassword)}
            bind:value={newPassword}
          />
          <button
            type="button"
            onclick={() => (showNew = !showNew)}
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={showNew ? 'Hide' : 'Show'}
          >
            {#if showNew}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            {:else}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            {/if}
          </button>
        </div>
        {#if errors.newPassword}<span class={errorClass}>{errors.newPassword}</span>{/if}
      </div>

      <!-- Confirm New Password -->
      <div class="flex flex-col gap-1.5">
        <label for="confirm-pw" class={labelTextClass}>Confirm New Password</label>
        <div class="relative">
          <input
            id="confirm-pw"
            type={showConfirm ? 'text' : 'password'}
            placeholder="Confirm new password"
            autocomplete="new-password"
            class={inputClass(!!errors.confirmPwd)}
            bind:value={confirmPwd}
          />
          <button
            type="button"
            onclick={() => (showConfirm = !showConfirm)}
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={showConfirm ? 'Hide' : 'Show'}
          >
            {#if showConfirm}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            {:else}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            {/if}
          </button>
        </div>
        {#if errors.confirmPwd}<span class={errorClass}>{errors.confirmPwd}</span>{/if}
      </div>

      <!-- Strength indicator -->
      {#if newPassword || confirmPwd}
        <div class="flex flex-col gap-2 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
          <div class="flex gap-1 mb-1">
            {#each [1,2,3,4] as step}
              <div class="h-1 flex-1 rounded-full transition-colors {step <= strengthScore
                ? strengthScore <= 1 ? 'bg-red-400'
                : strengthScore <= 2 ? 'bg-amber-400'
                : strengthScore <= 3 ? 'bg-blue-400'
                : 'bg-green-500'
                : 'bg-gray-200'}"></div>
            {/each}
          </div>
          {#each strengthChecks as check}
            <div class="flex items-center gap-2">
              <div class="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0
                          {check.pass ? 'bg-green-100' : 'bg-gray-200'}">
                {#if check.pass}
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                {:else}
                  <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                {/if}
              </div>
              <span class="text-[12px] {check.pass ? 'text-green-700' : 'text-gray-400'}">{check.label}</span>
            </div>
          {/each}
        </div>
      {/if}

      <div class="flex justify-end pt-2">
        <button
          type="submit"
          disabled={submitting || strengthScore < 4}
          class="px-6 py-2.5 text-[13px] font-semibold text-white bg-[#0B182A] hover:bg-[#162536] rounded-lg transition-colors disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
        >
          {submitting ? 'Updating…' : 'Update Password'}
        </button>
      </div>
    </form>
  </div>
</div>
