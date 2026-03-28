import { writable, derived } from 'svelte/store';

// ── Types ──────────────────────────────────────────────────────────────────

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  href?: string;
  read: boolean;
  createdAt: Date;
}

export type NewNotification = Omit<Notification, 'id' | 'read' | 'createdAt'>;

// ── Store ──────────────────────────────────────────────────────────────────

function createNotificationStore() {
  const { subscribe, update, set } = writable<Notification[]>([]);

  return {
    subscribe,

    push(n: NewNotification) {
      update((items) => [
        {
          ...n,
          id: crypto.randomUUID(),
          read: false,
          createdAt: new Date(),
        },
        ...items,
      ]);
    },

    markRead(id: string) {
      update((items) => items.map((n) => (n.id === id ? { ...n, read: true } : n)));
    },

    markAllRead() {
      update((items) => items.map((n) => ({ ...n, read: true })));
    },

    remove(id: string) {
      update((items) => items.filter((n) => n.id !== id));
    },

    clear() {
      set([]);
    },
  };
}

export const notifications = createNotificationStore();

// ── Derived ────────────────────────────────────────────────────────────────

export const unreadCount = derived(notifications, ($n) => $n.filter((n) => !n.read).length);
