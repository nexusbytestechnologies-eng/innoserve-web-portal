<script lang="ts">
  import "../layout.css";
  import Sidebar from "$lib/ui/Sidebar.svelte";
  import Header from "$lib/ui/Header.svelte";
  import { sidebarCollapsed } from "$lib/stores/app";
  let { children } = $props();
</script>

<svelte:head><title>Innoserve Techsol</title></svelte:head>

<div class="flex min-h-screen relative">
  <Sidebar />

  <div class="flex flex-col w-full h-screen">
    <Header />

    <main class="flex-1 px-8 pb-8 overflow-y-auto h-screen bg-stone-100 mt-2">
      {@render children()}
    </main>
  </div>
</div>
