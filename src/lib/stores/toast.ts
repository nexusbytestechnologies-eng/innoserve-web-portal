// Single import point for all toasts.
// Components must import from here — never directly from 'svelte-sonner'.
// Swap the underlying library here without touching call sites.

import { toast as _toast } from 'svelte-sonner';

export const toast = {
  success: (message: string, description?: string) =>
    _toast.success(message, description ? { description } : undefined),

  error: (message: string, description?: string) =>
    _toast.error(message, description ? { description } : undefined),

  info: (message: string, description?: string) =>
    _toast.info(message, description ? { description } : undefined),

  warning: (message: string, description?: string) =>
    _toast.warning(message, description ? { description } : undefined),

  /** Show a toast and return a promise — useful for async actions. */
  promise: _toast.promise.bind(_toast),
};
