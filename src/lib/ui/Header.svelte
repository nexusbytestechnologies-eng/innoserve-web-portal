<script lang="ts">
  import { currentPage, logout } from "../stores/app.js";

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
  <h1 class="text-[22px] font-semibold text-[#183E58]">
    {pageTitles[$currentPage as keyof typeof pageTitles] || "Dashboard"}
  </h1>

  <div class="flex items-center gap-4">
    <span class="text-[14px] text-[#183E58] font-normal">
      Welcome Back, <strong class="font-semibold">John</strong>
    </span>

    <!-- Notification Bell -->
    <button
      class="relative w-10 h-10 rounded-[10px] border border-gray-200 bg-white
             flex items-center justify-center cursor-pointer
             transition-all duration-150 ease-in-out hover:border-[#183E58]"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#183E58"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 01-3.46 0"></path>
      </svg>
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
          class="absolute top-12 right-0 bg-white border border-gray-200 rounded-[10px] p-1.5 min-w-[180px] shadow-[0_10px_30px_rgba(0,0,0,0.12)] z-50"
        >
          <button
            class="flex items-center gap-2.5 w-full px-3 py-2.5 border-none bg-transparent rounded-md text-[13px] font-[Poppins] text-gray-700 cursor-pointer transition-colors duration-150 hover:bg-gray-100"
            onclick={() => {
              showDropdown = false;
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              ><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle
                cx="12"
                cy="7"
                r="4"
              /></svg
            >
            Profile
          </button>
          <button
            class="flex items-center gap-2.5 w-full px-3 py-2.5 border-none bg-transparent rounded-md text-[13px] font-[Poppins] text-gray-700 cursor-pointer transition-colors duration-150 hover:bg-gray-100"
            onclick={() => {
              showDropdown = false;
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              ><circle cx="12" cy="12" r="3" /><path
                d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
              /></svg
            >
            Settings
          </button>
          <hr class="border-none border-t border-gray-200 my-1" />
          <button
            class="flex items-center gap-2.5 w-full px-3 py-2.5 border-none bg-transparent rounded-md text-[13px] font-[Poppins] text-red-600 cursor-pointer transition-colors duration-150 hover:bg-gray-100"
            onclick={() => {
              showDropdown = false;
              logout();
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              ><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline
                points="16 17 21 12 16 7"
              /><line x1="21" y1="12" x2="9" y2="12" /></svg
            >
            Logout
          </button>
        </div>
      {/if}
    </div>
  </div>
</header>
