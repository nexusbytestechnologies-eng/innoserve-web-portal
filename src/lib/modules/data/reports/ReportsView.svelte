<script>
  import * as Icons from "$lib/icons";

  let activeTab = $state("tickets");
  const tabs = [
    { id: "tickets", label: "Tickets Reports", count: 1250 },
    { id: "engineers", label: "Engineer Reports", count: 78 },
    { id: "payout", label: "Payout Report", count: 340 },
  ];

  const reportStats = [
    { label: "Total Tickets", value: "2,847", trend: "+12%", trendDir: "up", color: "#0B182A" },
    { label: "Avg Resolution Time", value: "3.2h", trend: "+8%", trendDir: "up", color: "#3b82f6" },
    { label: "SLA Compliance", value: "92%", trend: "-0%", trendDir: "down", color: "#22c55e" },
    { label: "Resolved Tickets", value: "47", trend: "-18%", trendDir: "down", color: "#ef4444" },
  ];

  const monthlyData = [
    { month: "Jan", opened: 180, resolved: 150 },
    { month: "Feb", opened: 220, resolved: 200 },
    { month: "Mar", opened: 280, resolved: 250 },
    { month: "Apr", opened: 200, resolved: 180 },
    { month: "May", opened: 300, resolved: 260 },
    { month: "Jun", opened: 350, resolved: 310 },
    { month: "Jul", opened: 380, resolved: 340 },
    { month: "Aug", opened: 420, resolved: 370 },
  ];

  const maxVal = 500;

  const quickInsights = [
    { label: "Resolution Rate", sublabel: "This month", value: "87.4%", trend: "+2.1%", trendDir: "up", icon: "check", color: "#22c55e" },
    { label: "First Response", sublabel: "Avg time", value: "42m", trend: "+5m faster", trendDir: "up", icon: "clock", color: "#3b82f6" },
    { label: "CSAT Score", sublabel: "Customer rating", value: "4.8/5", trend: "+0.2 pts", trendDir: "up", icon: "star", color: "#f59e0b" },
    { label: "Breach Rate", sublabel: "SLA breaches", value: "8%", trend: "+3% rise", trendDir: "down", icon: "alert", color: "#ef4444" },
    { label: "Active Engineers", sublabel: "On duty now", value: "34", trend: "+4 today", trendDir: "up", icon: "users", color: "#0B182A" },
  ];

  const stateData = [
    { state: "Maharashtra", region: "West India", total: 320, open: 45, resolved: 275, distribution: "86%", sla: 94, trend: "+12%" },
    { state: "Delhi", region: "North India", total: 280, open: 38, resolved: 242, distribution: "86%", sla: 91, trend: "+7%" },
  ];
</script>

<div class="flex flex-col gap-5">
  <!-- Tabs -->
  <div class="flex items-center gap-2 flex-wrap">
    {#each tabs as tab}
      <button
        onclick={() => (activeTab = tab.id)}
        class="flex items-center gap-2 px-5 py-2.5 rounded-lg border text-[13px] font-medium cursor-pointer transition-all duration-150
               {activeTab === tab.id ? 'bg-[linear-gradient(to_bottom,#0B182A,#021E44)] text-white border-[#0B182A]' : 'bg-white text-gray-500 border-gray-200 hover:border-[#0B182A]'}"
      >
        {#if tab.id === "tickets"}
          <Icons.TicketCard size={14} />
        {:else if tab.id === "engineers"}
          <Icons.Person size={14} />
        {:else}
          <Icons.Dollar size={14} />
        {/if}
        {tab.label}
        <span class="text-[11px] px-2 py-0.5 rounded-full {activeTab === tab.id ? 'bg-white/15' : 'bg-gray-100 text-gray-500'}">
          {tab.count}
        </span>
      </button>
    {/each}
    <div class="flex-1"></div>
    <button class="flex items-center gap-1.5 px-4 py-2.5 bg-[linear-gradient(to_bottom,#0B182A,#021E44)] hover:opacity-90 text-white text-[13px] font-semibold rounded-lg cursor-pointer border-none transition-opacity duration-150">
      <Icons.Download size={14} />
      Export Report
    </button>
  </div>

  <!-- Stats Row -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    {#each reportStats as stat}
      <div class="bg-white rounded-2xl p-5 border border-gray-100 flex flex-col gap-2">
        <div class="flex justify-between items-start">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background-color: {stat.color}20;">
            <Icons.TicketCard size={20} stroke={stat.color} />
          </div>
          <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full {stat.trendDir === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}">
            {stat.trend}
          </span>
        </div>
        <div class="text-[26px] font-bold text-[#0B182A]">{stat.value}</div>
        <div class="text-[12px] text-gray-500">{stat.label}</div>
        <div class="h-1 bg-gray-100 rounded-full overflow-hidden mt-1">
          <div class="h-full rounded-full w-[70%]" style="background-color: {stat.color};"></div>
        </div>
      </div>
    {/each}
  </div>

  <!-- Chart + Quick Insights -->
  <div class="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
    <!-- Bar Chart -->
    <div class="bg-white rounded-2xl p-6 border border-gray-100">
      <div class="flex justify-between items-start mb-6">
        <div>
          <h3 class="text-[16px] font-semibold text-[#0B182A]">Monthly Ticket Volume</h3>
          <p class="text-[12px] text-gray-400 mt-0.5">Jan – Aug 2026 · Opened vs Resolved</p>
        </div>
        <span class="px-3.5 py-1 rounded-full bg-green-50 text-green-600 text-[12px] font-medium">Peak: Aug 420</span>
      </div>

      <!-- Bar Chart -->
      <div class="flex gap-3 h-60">
        <!-- Y-axis -->
        <div class="flex flex-col justify-between text-[11px] text-gray-400 pb-6">
          {#each [500, 400, 300, 200, 100, 0] as label}
            <span>{label}</span>
          {/each}
        </div>

        <!-- Bars area -->
        <div class="flex-1 relative pb-6">
          <!-- Grid lines -->
          <div class="absolute inset-0 bottom-6 flex flex-col justify-between">
            {#each [0, 1, 2, 3, 4, 5] as _}
              <div class="border-b border-gray-100"></div>
            {/each}
          </div>

          <!-- Bars -->
          <div class="absolute inset-0 pb-6 flex items-end justify-around">
            {#each monthlyData as d}
              <div class="flex flex-col items-center gap-1.5">
                <div class="flex gap-1 items-end">
                  <div class="w-5 bg-blue-500 rounded-t" style="height: {(d.opened / maxVal) * 200}px;"></div>
                  <div class="w-5 bg-green-500 rounded-t" style="height: {(d.resolved / maxVal) * 200}px;"></div>
                </div>
                <span class="text-[11px] text-gray-400">{d.month}</span>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Insights -->
    <div class="bg-white rounded-2xl p-5 border border-gray-100 flex flex-col">
      <h3 class="text-[16px] font-semibold text-[#0B182A]">Quick Insights</h3>
      <p class="text-[12px] text-gray-400 mb-4">Live operational stats</p>

      <div class="flex flex-col gap-3 flex-1">
        {#each quickInsights as insight}
          <div class="flex items-center gap-3 py-2">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style="background: {insight.color}20;">
              {#if insight.icon === "check"}
                <Icons.Check size={16} stroke={insight.color} strokeWidth={2.5} />
              {:else if insight.icon === "clock"}
                <Icons.Clock size={16} stroke={insight.color} />
              {:else if insight.icon === "star"}
                <Icons.Star size={16} stroke={insight.color} />
              {:else if insight.icon === "alert"}
                <Icons.AlertTriangle size={16} stroke={insight.color} />
              {:else}
                <Icons.Users size={16} stroke={insight.color} />
              {/if}
            </div>
            <div class="flex-1">
              <div class="text-[13px] font-medium text-[#0B182A]">{insight.label}</div>
              <div class="text-[11px] text-gray-400">{insight.sublabel}</div>
            </div>
            <div class="text-right">
              <div class="text-[16px] font-bold text-[#0B182A]">{insight.value}</div>
              <div class="text-[11px] font-medium {insight.trendDir === 'up' ? 'text-green-500' : 'text-red-500'}">
                {insight.trend}
              </div>
            </div>
          </div>
        {/each}
      </div>

      <!-- SLA Score Card -->
      <div class="flex items-center justify-between bg-[#E87D1F] rounded-xl px-5 py-4 mt-3">
        <div>
          <div class="text-[12px] text-white/80">Overall SLA Score</div>
          <div class="text-[24px] font-bold text-white">87.4%</div>
        </div>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" opacity="0.6">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      </div>
    </div>
  </div>

  <!-- Tickets by State -->
  <div class="bg-white rounded-2xl p-6 border border-gray-100">
    <div class="flex justify-between items-center mb-4">
      <div class="flex items-center gap-3">
        <h3 class="text-[18px] font-semibold text-[#0B182A]">Tickets by State</h3>
        <span class="text-[12px] text-gray-500 bg-gray-100 px-3 py-1 rounded-full">10 states</span>
      </div>
      <div class="flex gap-2">
        <button class="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-[13px] text-gray-600 bg-white cursor-pointer hover:border-[#0B182A] transition-colors duration-150">
          <Icons.Filter size={14} />
          Filter
        </button>
        <button class="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-[13px] text-gray-600 bg-white cursor-pointer hover:border-[#0B182A] transition-colors duration-150">
          <Icons.Download size={14} />
          Export
        </button>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-sm border-collapse">
        <thead>
          <tr class="border-b border-gray-100">
            {#each ["STATE", "TOTAL", "OPEN", "RESOLVED", "DISTRIBUTION", "SLA % ↓", "7-DAY TREND", "ACTIONS"] as col}
              <th class="text-left text-[11px] font-semibold text-gray-400 tracking-wide py-3 px-3 whitespace-nowrap">{col}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each stateData as s}
            <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td class="py-3 px-3">
                <div class="text-[13px] font-medium text-gray-700">{s.state}</div>
                <div class="text-[11px] text-gray-400">{s.region}</div>
              </td>
              <td class="py-3 px-3 text-[13px] font-semibold text-gray-700">{s.total}</td>
              <td class="py-3 px-3 text-[13px] text-gray-600">{s.open}</td>
              <td class="py-3 px-3 text-[13px] text-gray-600">{s.resolved}</td>
              <td class="py-3 px-3 text-[13px] text-gray-600">{s.distribution}</td>
              <td class="py-3 px-3">
                <span class="text-[12px] font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-600">{s.sla}%</span>
              </td>
              <td class="py-3 px-3 text-[13px] font-medium text-green-500">{s.trend}</td>
              <td class="py-3 px-3">
                <div class="flex gap-1">
                  <button aria-label="View state" class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#0B182A] hover:bg-gray-100 transition-colors">
                    <Icons.Eye size={16} />
                  </button>
                  <button aria-label="Edit state" class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#0B182A] hover:bg-gray-100 transition-colors">
                    <Icons.Edit size={16} />
                  </button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-gray-100 mt-2 gap-3">
      <span class="text-[13px] text-gray-500">Showing <strong>1–2</strong> of 10 States</span>
      <div class="flex items-center gap-1">
        {#each ["< Previous", "1", "2", "3", "10", "Next >"] as page}
          <button
            disabled={page === "< Previous"}
            class="px-3 py-1.5 text-[12px] rounded-md border transition-colors
                   {page === '1' ? 'bg-[linear-gradient(to_bottom,#0B182A,#021E44)] text-white border-[#0B182A]' : 'bg-white text-gray-500 border-gray-200 hover:border-[#0B182A] hover:text-[#0B182A]'}
                   {page === '< Previous' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}">{page}</button>
        {/each}
      </div>
    </div>
  </div>
</div>
