import { writable } from "svelte/store";

export const currentPage = writable("login");
export const sidebarCollapsed = writable(false);
export const mobileOpen = writable(false);
export const isLoggedIn = writable(false);

/**
 * @param {string} page
 */
export function navigateTo(page) {
  currentPage.set(page);
}

export function toggleSidebar() {
  sidebarCollapsed.update((v) => !v);
}

export function toggleMobileSidebar() {
  mobileOpen.update((v) => !v);
}

export function closeMobileSidebar() {
  mobileOpen.set(false);
}

export function login() {
  isLoggedIn.set(true);
  currentPage.set("dashboard");
}

export function logout() {
  isLoggedIn.set(false);
  currentPage.set("login");
}
