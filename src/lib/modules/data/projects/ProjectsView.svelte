<script>
  import * as Icons from "$lib/icons";

  let view = $state("table");

  const projects = [
    { id: "PRJ001", name: "ATM Deployment", customer: "HDFC Bank", location: "Kerala", sla: "4h Response", tickets: 12, completed: 34, status: "Active", tags: ["Hardware", "Networking"] },
    { id: "PRJ002", name: "Server Setup", customer: "SBI Bank", location: "TamilNadu", sla: "2h Response", tickets: 8, completed: 20, status: "Inactive", tags: ["Software", "Deployment"] },
    { id: "PRJ003", name: "Network Upgrade", customer: "ICICI Bank", location: "Maharashtra", sla: "2h Response", tickets: 0, completed: 15, status: "Active", tags: ["Networking"] },
    { id: "PRJ004", name: "Branch Cabling", customer: "Axis Bank", location: "Rajasthan", sla: "4h Response", tickets: 15, completed: 40, status: "Inactive", tags: ["Hardware", "Electrical"] },
    { id: "PRJ005", name: "POS Terminal Install", customer: "Kotak Bank", location: "Delhi", sla: "4h Response", tickets: 5, completed: 18, status: "Active", tags: ["Hardware", "Software"] },
    { id: "PRJ006", name: "Biometric Setup", customer: "Canara Bank", location: "Mumbai", sla: "3h Response", tickets: 3, completed: 22, status: "Active", tags: ["Electrical", "Software"] },
    { id: "PRJ007", name: "Branch Cabling", customer: "Axis Bank", location: "Rajasthan", sla: "4h Response", tickets: 15, completed: 31, status: "Inactive", tags: ["Hardware", "Networking"] },
    { id: "PRJ008", name: "POS Terminal Install", customer: "Kotak Bank", location: "Delhi", sla: "4h Response", tickets: 5, completed: 10, status: "Active", tags: ["Hardware"] },
    { id: "PRJ009", name: "Biometric Setup", customer: "Canara Bank", location: "Mumbai", sla: "3h Response", tickets: 3, completed: 27, status: "Active", tags: ["Electrical", "Software"] },
  ];
</script>

<div class="flex flex-col gap-5">
  <!-- Filter Bar -->
  <div class="flex items-center gap-3 flex-wrap bg-white rounded-xl px-5 py-4 shadow">
    <div class="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg flex-1 max-w-100">
      <Icons.Search size={16} stroke="#9ca3af" />
      <input type="text" placeholder="Search" class="text-[13px] outline-none border-none w-full text-gray-600 placeholder:text-gray-400" />
    </div>

    <button class="flex items-center gap-1.5 p-3 border border-gray-200 rounded-lg text-[13px] text-gray-600 bg-white cursor-pointer hover:border-[#0B182A] transition-colors duration-150">
      <Icons.Circle size={14} />
      Status
      <Icons.ChevronDown size={12} />
    </button>

    <button class="flex items-center gap-1.5 p-3 border border-gray-200 rounded-lg text-[13px] text-gray-600 bg-white cursor-pointer hover:border-[#0B182A] transition-colors duration-150">
      <Icons.Person size={14} />
      Customer
      <Icons.ChevronDown size={12} />
    </button>

    <button class="flex items-center gap-1.5 p-3 border border-gray-200 rounded-lg text-[13px] text-gray-600 bg-white cursor-pointer hover:border-[#0B182A] transition-colors duration-150">
      <Icons.MapPin size={14} />
      State
      <Icons.ChevronDown size={12} />
    </button>

    <button class="flex items-center gap-1.5 px-4 py-2.5 bg-[#E87D1F] hover:bg-[#E87D1F]/90 text-white text-[13px] font-semibold rounded-lg cursor-pointer border-none transition-colors duration-150 ml-auto">
      <Icons.Plus size={14} strokeWidth={2.5} />
      Add Project
    </button>
  </div>

  <!-- Content Card -->
  <div class="bg-white rounded-2xl p-6 shadow">
    <!-- Header -->
    <div class="flex justify-between items-center mb-4">
      <div class="flex items-center gap-3">
        <h3 class="text-[18px] font-semibold text-[#0B182A]">All Projects</h3>
        <span class="text-[12px] text-gray-500 bg-gray-100 px-3 py-1 rounded-full">48 Total</span>
      </div>
      <div class="flex gap-2">
        <!-- View Toggle -->
        <div class="flex border border-gray-200 rounded-lg overflow-hidden">
          <button
            onclick={() => (view = "table")}
            class="flex items-center gap-1.5 px-3 py-1.5 text-[13px] transition-colors duration-150 {view === 'table' ? 'bg-[linear-gradient(to_bottom,#0B182A,#021E44)] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}"
          >
            <Icons.List size={14} />
          </button>
          <button
            onclick={() => (view = "card")}
            class="flex items-center gap-1.5 px-3 py-1.5 text-[13px] transition-colors duration-150 {view === 'card' ? 'bg-[linear-gradient(to_bottom,#0B182A,#021E44)] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}"
          >
            <Icons.Grid size={14} />
          </button>
        </div>

        <button class="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-[13px] text-gray-600 bg-white cursor-pointer hover:border-[#0B182A] transition-colors duration-150">
          <Icons.Download size={14} />
          Export
        </button>
      </div>
    </div>

    <!-- Table View -->
    {#if view === "table"}
      <div class="overflow-x-auto">
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="border-b border-gray-100">
              {#each ["PROJECT ID", "PROJECT NAME", "CUSTOMER", "LOCATION", "SLA", "TICKETS", "STATUS", "ACTIONS"] as col}
                <th class="text-left text-[11px] font-semibold text-gray-400 tracking-wide py-3 px-3 whitespace-nowrap">{col}</th>
              {/each}
            </tr>
          </thead>
          <tbody>
            {#each projects as p}
              <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td class="py-3 px-3 text-[#E87D1F] font-medium text-[13px]">{p.id}</td>
                <td class="py-3 px-3 text-[13px] text-gray-700">{p.name}</td>
                <td class="py-3 px-3 text-[13px] text-gray-600">{p.customer}</td>
                <td class="py-3 px-3 text-[13px] text-gray-600">{p.location}</td>
                <td class="py-3 px-3">
                  <span class="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">{p.sla}</span>
                </td>
                <td class="py-3 px-3 text-[13px] text-gray-600">{p.tickets}</td>
                <td class="py-3 px-3">
                  <span class="text-[11px] font-semibold px-2.5 py-1 rounded-full {p.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}">
                    {p.status}
                  </span>
                </td>
                <td class="py-3 px-3">
                  <div class="flex gap-1">
                    <button aria-label="View project" class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#0B182A] hover:bg-gray-100 transition-colors">
                      <Icons.Eye size={16} />
                    </button>
                    <button aria-label="Edit project" class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#0B182A] hover:bg-gray-100 transition-colors">
                      <Icons.Edit size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}

    <!-- Card View -->
    {#if view === "card"}
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {#each projects as p}
          <div class="border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
            <div class="flex items-start justify-between gap-2">
              <div>
                <h4 class="text-[16px] font-semibold text-gray-800">{p.name}</h4>
                <p class="text-[12px] text-[#E87D1F] font-medium mt-0.5">{p.id}</p>
              </div>
              <span class="flex items-center gap-1 text-[11px] text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0">
                <Icons.MapPin size={10} />
                {p.location}
              </span>
            </div>
            <div class="flex flex-wrap gap-1.5 mt-3">
              <span class="text-[11px] px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">{p.customer}</span>
              {#each p.tags as tag}
                <span class="text-[11px] px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 font-medium">{tag}</span>
              {/each}
            </div>
            <div class="border-t border-gray-100 my-4"></div>
            <div class="grid grid-cols-3 divide-x divide-gray-100">
              <div class="pr-3">
                <p class="text-[10px] text-orange-400 font-semibold mb-1">Open Tickets</p>
                <p class="text-[18px] font-bold text-[#E87D1F] leading-none">{p.tickets}</p>
              </div>
              <div class="px-3">
                <p class="text-[10px] text-green-500 font-semibold mb-1">Completed</p>
                <p class="text-[18px] font-bold text-green-500 leading-none">{p.completed}</p>
              </div>
              <div class="pl-3">
                <p class="text-[10px] text-blue-500 font-semibold mb-1">SLA</p>
                <p class="text-[13px] font-bold text-blue-600 leading-none mt-1">{p.sla}</p>
              </div>
            </div>
            <div class="mt-4 flex justify-end">
              <span class="text-[11px] font-semibold px-2.5 py-1 rounded-full {p.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}">
                {p.status}
              </span>
            </div>
          </div>
        {/each}
      </div>
    {/if}

    <!-- Pagination -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-gray-100 mt-4 gap-3">
      <span class="text-[13px] text-gray-500">Showing <strong>1–9</strong> of 48 Projects</span>
      <div class="flex items-center gap-1">
        {#each ["< Previous", "1", "2", "3", "...", "48", "Next >"] as page}
          <button
            disabled={page === "< Previous"}
            class="px-3 py-1.5 text-[12px] rounded-md border transition-colors
                   {page === '1' ? 'bg-[linear-gradient(to_bottom,#0B182A,#021E44)] text-white border-[#0B182A]' : 'bg-white text-gray-500 border-gray-200 hover:border-[#0B182A] hover:text-[#0B182A]'}
                   {page === '< Previous' || page === '...' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}">{page}</button>
        {/each}
      </div>
    </div>
  </div>
</div>
