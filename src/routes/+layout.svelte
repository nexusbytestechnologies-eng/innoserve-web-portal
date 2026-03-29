<script lang="ts">
  import "./layout.css";
  import favicon from "$lib/assets/favicon.svg";
  import { Toaster } from "svelte-sonner";
  import { authStore } from "$lib/stores/auth";
  import { notifications } from "$lib/stores/notifications";
  import { fetchNotifications } from "$lib/api/notifications";

  let { data, children } = $props();

  // Hydrate the auth store from the server-loaded user (runs once on mount / after SSR)
  $effect(() => {
    if (data.user) {
      authStore.setUser(data.user);
    }
  });

  // Fetch notifications from backend and seed the store (client-side only)
  $effect(() => {
    if (data.user) {
      fetchNotifications().then((items) => {
        if (items.length > 0) notifications.seed(items);
      });
    }
  });
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
<Toaster richColors position="top-right" expand={true} />
