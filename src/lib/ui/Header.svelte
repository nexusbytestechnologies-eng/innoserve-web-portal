<script lang="ts">
  import { currentPage, logout } from "../stores/app.js";
  import * as Icons from "$lib/icons";

  const pageTitles = {
    dashboard: "Dashboard",
    tickets: "Tickets",
    "bulk-upload": "Bulk Upload",
    customers: "Customers",
    projects: "Projects",
    engineers: "Engineers",
    inventory: "Inventory",
    reports: "Reports",
  };

  let showDropdown = $state(false);
</script>

<header
  class="flex items-center justify-between px-8 py-4 bg-transparent shadow"
>
  <h1 class="text-[22px] font-semibold text-[#0B182A]">
    {pageTitles[$currentPage as keyof typeof pageTitles] || "Dashboard"}
  </h1>

  <div class="flex items-center gap-4">
    <span class="text-[14px] text-[#0B182A] font-normal">
      Welcome Back, <strong class="font-semibold">John</strong>
    </span>

    <!-- Notification Bell -->
    <button
      class="relative w-10 h-10 rounded-[10px] border border-gray-200 bg-white
             flex items-center justify-center cursor-pointer
             transition-all duration-150 ease-in-out hover:border-[#0B182A]"
    >
      <Icons.Bell size={20} stroke="#0B182A" />
      <span
        class="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-[#E87D1F] border-2 border-white"
      ></span>
    </button>

    <!-- User Avatar -->
    <div class="relative">
      <button
        class="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 cursor-pointer p-0 bg-transparent"
        onclick={() => (showDropdown = !showDropdown)}
      >
        <img
          src="https://ui-avatars.com/api/?name=John&background=E87D1F&color=fff&size=36&font-size=0.4&bold=true"
          alt="User"
          class="w-full h-full object-cover block"
        />
      </button>

      {#if showDropdown}
        <div
          class="absolute top-12 right-0 bg-white border border-gray-200 rounded-[10px] p-1.5 min-w-45 shadow-[0_10px_30px_rgba(0,0,0,0.12)] z-50"
        >
          <button
            class="flex items-center gap-2.5 w-full px-3 py-2.5 border-none bg-transparent rounded-md text-[13px] text-gray-700 cursor-pointer transition-colors duration-150 hover:bg-gray-100"
            onclick={() => { showDropdown = false; }}
          >
            <Icons.Person size={16} />
            Profile
          </button>
          <button
            class="flex items-center gap-2.5 w-full px-3 py-2.5 border-none bg-transparent rounded-md text-[13px] text-gray-700 cursor-pointer transition-colors duration-150 hover:bg-gray-100"
            onclick={() => { showDropdown = false; }}
          >
            <Icons.Settings size={16} />
            Settings
          </button>
          <hr class="border-none border-t border-gray-200 my-1" />
          <button
            class="flex items-center gap-2.5 w-full px-3 py-2.5 border-none bg-transparent rounded-md text-[13px] text-red-600 cursor-pointer transition-colors duration-150 hover:bg-gray-100"
            onclick={() => { showDropdown = false; logout(); }}
          >
            <Icons.LogOut size={16} />
            Logout
          </button>
        </div>
      {/if}
    </div>
  </div>
</header>
