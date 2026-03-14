<script>
  import {
    currentPage,
    sidebarCollapsed,
    navigateTo,
    toggleSidebar,
  } from "../stores/app.js";

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "tickets", label: "Tickets", icon: "tickets" },
    { id: "bulk-upload", label: "Bulk Upload", icon: "upload" },
    { id: "customers", label: "Customers", icon: "customers" },
    { id: "projects", label: "Projects", icon: "projects" },
    { id: "engineers", label: "Engineers", icon: "engineers" },
    { id: "inventory", label: "Inventory", icon: "inventory" },
    { id: "reports", label: "Reports", icon: "reports" },
  ];
</script>

<aside
  class=" top-0 left-0 h-screen flex flex-col z-100 bg-[#183E58]
         transition-[width,transform] duration-300 ease-in-out overflow-visible
         {$sidebarCollapsed
    ? 'w-17.5 -translate-x-full md:translate-x-0'
    : 'w-55 translate-x-0'}"
>
  <!-- Logo Area -->
  <div class="px-4 py-5 border-b border-white/8 min-h-20 flex items-center">
    {#if !$sidebarCollapsed}
      <div class="flex items-center gap-2.5 whitespace-nowrap overflow-hidden">
        <div class="shrink-0">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="8" fill="#E87D1F" />
            <path d="M10 18L18 10L26 18L18 26L10 18Z" fill="#183E58" />
            <path d="M14 18L18 14L22 18L18 22L14 18Z" fill="white" />
          </svg>
        </div>
        <div class="flex flex-col leading-[1.15]">
          <span class="text-[14px] font-bold text-white tracking-[1px]">
            INNO<span class="text-[#E87D1F]">SERVE</span>
          </span>
          <span class="text-[14px] font-bold text-white tracking-[1px]"
            >TECHSOL</span
          >
          <span class="text-[7px] text-white/60 tracking-[0.5px] mt-0.5">
            YOUR SUCCESS IS <span class="text-[#E87D1F]">OUR GOAL</span>
          </span>
        </div>
      </div>
    {:else}
      <div class="flex items-center justify-center w-full">
        <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
          <rect width="36" height="36" rx="8" fill="#E87D1F" />
          <path d="M10 18L18 10L26 18L18 26L10 18Z" fill="#183E58" />
          <path d="M14 18L18 14L22 18L18 22L14 18Z" fill="white" />
        </svg>
      </div>
    {/if}
  </div>

  <!-- Toggle Button — overlaps sidebar edge -->
  <button
    onclick={toggleSidebar}
    class="absolute top-20.5 -right-3.5 w-7 h-7 rounded-full
           bg-[#183E58] border-2 border-[#F5F6FA]
           flex items-center justify-center cursor-pointer z-101
           shadow-[0_2px_8px_rgba(0,0,0,0.15)]
           transition-all duration-200 ease-in-out
           hover:bg-[#1e4d6e] hover:scale-110"
  >
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      {#if $sidebarCollapsed}
        <polyline points="9 18 15 12 9 6"></polyline>
      {:else}
        <polyline points="15 18 9 12 15 6"></polyline>
      {/if}
    </svg>
  </button>

  <!-- Navigation -->
  <nav
    class="flex flex-col flex-1 px-2.5 py-4 gap-0.5 overflow-y-auto overflow-x-hidden"
  >
    {#each menuItems as item}
      <button
        onclick={() => navigateTo(item.id)}
        title={$sidebarCollapsed ? item.label : ""}
        class="flex items-center rounded-lg border-none cursor-pointer
               font-[Poppins] text-[14px] font-normal whitespace-nowrap overflow-hidden w-full
               transition-all duration-200 ease-in-out
               {$sidebarCollapsed
          ? 'justify-center p-3'
          : 'gap-3 px-3.5 py-3 text-left'}
               {$currentPage === item.id
          ? 'bg-[#E87D1F] text-white font-medium'
          : 'bg-transparent text-white/65 hover:text-white hover:bg-white/8'}"
      >
        <!-- Icon -->
        <span class="shrink-0 flex items-center justify-center w-5 h-5">
          {#if item.icon === "dashboard"}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="3" width="7" height="7" rx="1"></rect>
              <rect x="14" y="3" width="7" height="7" rx="1"></rect>
              <rect x="3" y="14" width="7" height="7" rx="1"></rect>
              <rect x="14" y="14" width="7" height="7" rx="1"></rect>
            </svg>
          {:else if item.icon === "tickets"}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
              ></path>
            </svg>
          {:else if item.icon === "upload"}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          {:else if item.icon === "customers"}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
              <path d="M16 3.13a4 4 0 010 7.75"></path>
            </svg>
          {:else if item.icon === "projects"}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"
              ></path>
            </svg>
          {:else if item.icon === "engineers"}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"
              ></path>
            </svg>
          {:else if item.icon === "inventory"}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"
              ></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          {:else if item.icon === "reports"}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
          {/if}
        </span>

        {#if !$sidebarCollapsed}
          <span class="overflow-hidden text-ellipsis">{item.label}</span>
        {/if}
      </button>
    {/each}
  </nav>
</aside>
