<script>
  import * as Icons from "$lib/icons";

  const engineers = [
    { id: "ENG001", name: "Rajesh Kumar", location: "Mumbai, Maharashtra", skills: ["Hard Ware", "Networking"], ticketsAssigned: 1, completed: 28, sla: "89%" },
    { id: "ENG002", name: "Rahul", location: "Thiruvananthapuram, Kerala", skills: ["Deployment", "Hardware"], ticketsAssigned: 1, completed: 28, sla: "89%" },
    { id: "ENG003", name: "Akshay", location: "Ernakulam, Kerala", skills: ["Electrical", "Software"], ticketsAssigned: 7, completed: 47, sla: "90%" },
    { id: "ENG004", name: "Manoj", location: "Pune, Maharashtra", skills: ["Hard Ware", "Networking"], ticketsAssigned: 5, completed: 55, sla: "88%" },
    { id: "ENG005", name: "Priya", location: "Ernakulam, Kerala", skills: ["Deployment", "Hardware"], ticketsAssigned: 7, completed: 60, sla: "79%" },
    { id: "ENG006", name: "Suresh", location: "Chennai, TamilNadu", skills: ["Electrical", "Software"], ticketsAssigned: 0, completed: 18, sla: "83%" },
    { id: "ENG007", name: "Vikram", location: "Mumbai, Maharashtra", skills: ["Hard Ware", "Networking"], ticketsAssigned: 3, completed: 22, sla: "79%" },
    { id: "ENG008", name: "Nisha", location: "Thiruvananthapuram, Kerala", skills: ["Deployment", "Hardware"], ticketsAssigned: 8, completed: 38, sla: "84%" },
    { id: "ENG009", name: "Kiran", location: "TamilNadu", skills: ["Electrical", "Software"], ticketsAssigned: 1, completed: 28, sla: "89%" },
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
      <Icons.Spanner size={14} />
      Skill
      <Icons.ChevronDown size={12} />
    </button>

    <button class="flex items-center gap-1.5 p-3 border border-gray-200 rounded-lg text-[13px] text-gray-600 bg-white cursor-pointer hover:border-[#0B182A] transition-colors duration-150">
      <Icons.MapPin size={14} />
      State
      <Icons.ChevronDown size={12} />
    </button>

    <button class="flex items-center gap-1.5 px-4 py-2.5 bg-[#E87D1F] hover:bg-[#E87D1F]/90 text-white text-[13px] font-semibold rounded-lg cursor-pointer border-none transition-colors duration-150 ml-auto">
      <Icons.Plus size={14} strokeWidth={2.5} />
      Add Engineer
    </button>
  </div>

  <!-- Engineer Cards Grid -->
  <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
    {#each engineers as eng}
      <div class="bg-white rounded-2xl p-5 border border-gray-200 hover:shadow-md transition-shadow duration-200">
        <!-- Card Header -->
        <div class="flex justify-between items-start mb-3.5">
          <div class="flex flex-col">
            <h4 class="text-[15px] font-semibold text-[#0B182A]">{eng.name}</h4>
            <p class="text-[12px] text-[#E87D1F] font-medium mt-px">{eng.id}</p>
          </div>
          <span class="flex items-center gap-1 text-[11px] text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100 whitespace-nowrap shrink-0">
            <Icons.MapPin size={12} stroke="#6b7280" />
            {eng.location}
          </span>
        </div>

        <!-- Skills -->
        <div class="flex gap-2 mb-4">
          {#each eng.skills as skill}
            <span class="px-3.5 py-1 rounded-md text-[11px] font-medium bg-blue-50 text-blue-600">{skill}</span>
          {/each}
        </div>

        <!-- Stats -->
        <div class="flex items-center justify-between pt-3.5 border-t border-gray-100">
          <div class="flex items-center gap-2">
            <span class="text-[10px] text-gray-400 leading-snug">Tickets<br />Assigned</span>
            <span class="text-[18px] font-bold text-[#E87D1F]">{eng.ticketsAssigned}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[10px] text-gray-400 leading-snug">Completed<br />Assigned</span>
            <span class="text-[18px] font-bold text-[#0B182A]">{eng.completed}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[10px] text-gray-400 leading-snug">SLA</span>
            <span class="text-[16px] font-bold text-[#0B182A]">{eng.sla}</span>
          </div>
        </div>
      </div>
    {/each}
  </div>

  <!-- Pagination -->
  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white rounded-xl px-6 py-4 shadow gap-3">
    <span class="text-[13px] text-gray-500">Showing <strong>1–9</strong> of 78 Engineers</span>
    <div class="flex items-center gap-1">
      {#each ["< Previous", "1", "2", "3", "78", "Next >"] as page}
        <button
          disabled={page === "< Previous"}
          class="px-3 py-1.5 text-[12px] rounded-md border transition-colors
                 {page === '1' ? 'bg-[linear-gradient(to_bottom,#0B182A,#021E44)] text-white border-[#0B182A]' : 'bg-white text-gray-500 border-gray-200 hover:border-[#0B182A] hover:text-[#0B182A]'}
                 {page === '< Previous' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}">{page}</button>
      {/each}
    </div>
  </div>
</div>
