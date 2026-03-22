<script>
  import { onMount } from "svelte";
  import * as Icons from "$lib/icons";

  let activeFilter = $state("All");
  const filters = ["All", "Open", "Pending", "Resolved", "New Tickets"];

  const stats = [
    {
      label: "Total Tickets",
      value: "1,250",
      trend: "+12%",
      trendDir: "up",
      color: "#0B182A",
      icon: "ticket",
    },
    {
      label: "Open Tickets",
      value: "320",
      trend: "+8%",
      trendDir: "up",
      color: "#3b82f6",
      icon: "open",
    },
    {
      label: "Pending Tickets",
      value: "210",
      trend: "-2%",
      trendDir: "down",
      color: "#f59e0b",
      icon: "pending",
    },
    {
      label: "Resolved Tickets",
      value: "540",
      trend: "+18%",
      trendDir: "up",
      color: "#22c55e",
      icon: "resolved",
    },
    {
      label: "Closed Tickets",
      value: "180",
      trend: "+3%",
      trendDir: "up",
      color: "#6b7280",
      icon: "closed",
    },
  ];

  const recentTickets = [
    {
      id: "TKT001",
      issue: "Database Error",
      sub: "SBI Bank",
      sla: "Breached",
      place: "Kerala",
      engineer: "Arun",
      status: "Open",
      priority: "High",
      date: "12/03/2026",
    },
    {
      id: "TKT002",
      issue: "Network Device Failure",
      sub: "SBI Bank",
      sla: "On Track",
      place: "Tamil Nadu",
      engineer: "Anandhu",
      status: "Open",
      priority: "Medium",
      date: "12/03/2026",
    },
    {
      id: "TKT002",
      issue: "Network Device Failure",
      sub: "SBI Bank",
      sla: "On Track",
      place: "Tamil Nadu",
      engineer: "Anandhu",
      status: "Open",
      priority: "Medium",
      date: "12/03/2026",
    },
  ];

  const donutData = [
    { label: "Open", value: 350, color: "#3b82f6" },
    { label: "Pending", value: 210, color: "#E87D1F" },
    { label: "Resolved", value: 540, color: "#22c55e" },
    { label: "Closed", value: 180, color: "#9ca3af" },
  ];

  const total = donutData.reduce((sum, d) => sum + d.value, 0);

  function getDonutPaths() {
    const cx = 120,
      cy = 120,
      r = 90,
      strokeWidth = 32;
    const circumference = 2 * Math.PI * r;
    let offset = -circumference / 4;
    return donutData.map((d) => {
      const pct = d.value / total;
      const dashArray = `${pct * circumference} ${(1 - pct) * circumference}`;
      const path = { ...d, dashArray, offset, r, cx, cy, strokeWidth };
      offset += pct * circumference;
      return path;
    });
  }

  const donutPaths = getDonutPaths();
</script>

<div class="flex flex-col gap-6">
  <!-- Stat Cards Row -->
  <div class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
    {#each stats as stat}
      <div
        class="bg-white rounded-2xl shadow border border-amber-50 relative overflow-hidden
               flex items-center gap-4 px-4 py-3.5
               sm:flex-col sm:items-start sm:gap-1 sm:p-5"
      >
        <!-- Coloured accent strip — mobile only -->
        <div
          class="absolute top-0 left-0 bottom-0 w-1 sm:hidden"
          style="background-color: {stat.color};"
        ></div>

        <!-- Icon -->
        <div
          class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 sm:mb-1"
          style="background-color: {stat.color}18;"
        >
          {#if stat.icon === "ticket"}
            <Icons.TicketCard size={20} stroke={stat.color} />
          {:else if stat.icon === "open"}
            <Icons.Activity size={20} stroke={stat.color} />
          {:else if stat.icon === "pending"}
            <Icons.Clock size={20} stroke={stat.color} />
          {:else if stat.icon === "resolved"}
            <Icons.CheckCircle size={20} stroke={stat.color} />
          {:else if stat.icon === "closed"}
            <Icons.XSquare size={20} stroke={stat.color} />
          {/if}
        </div>

        <!-- Value + label -->
        <div class="flex-1 min-w-0 sm:flex-none">
          <div class="text-[21px] sm:text-[22px] font-bold text-[#0B182A] leading-tight">
            {stat.value}
          </div>
          <div class="text-[12px] sm:text-[13px] text-gray-400">{stat.label}</div>
        </div>

        <!-- Trend badge — inline on mobile, absolute on desktop -->
        <span
          class="text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0
                 sm:absolute sm:top-4 sm:right-4
                 {stat.trendDir === 'up'
            ? 'text-green-600 bg-green-50'
            : 'text-red-500 bg-red-50'}"
        >
          {stat.trend}
        </span>
      </div>
    {/each}
  </div>

  <!-- Middle Section: Donut Chart + Metrics -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Donut Chart Card -->
    <div class="bg-white rounded-2xl p-6 border-amber-50 shadow">
      <div class="flex justify-between items-start mb-5">
        <div>
          <h3 class="text-base font-semibold text-[#0B182A]">
            Ticket Status Distribution
          </h3>
          <p class="text-[12px] text-gray-400 mt-0.5">
            Current Period Breakdown
          </p>
        </div>
        <select
          class="px-3 py-1.5 border border-gray-200 rounded-md text-[12px] text-green-600 bg-green-50 cursor-pointer outline-none"
        >
          <option>This Month</option>
          <option>Last Month</option>
          <option>This Year</option>
        </select>
      </div>

      <div class="flex justify-center py-2.5">
        <svg width="240" height="240" viewBox="0 0 240 240">
          {#each donutPaths as path}
            <circle
              cx={path.cx}
              cy={path.cy}
              r={path.r}
              fill="none"
              stroke={path.color}
              stroke-width={path.strokeWidth}
              stroke-dasharray={path.dashArray}
              stroke-dashoffset={-path.offset}
              stroke-linecap="butt"
            />
          {/each}
          <text
            x="120"
            y="112"
            text-anchor="middle"
            font-size="32"
            font-weight="700"
            fill="#0B182A">1,250</text
          >
          <text
            x="120"
            y="136"
            text-anchor="middle"
            font-size="13"
            fill="#9ca3af">Total</text
          >
        </svg>
      </div>

      <div class="grid grid-cols-2 gap-3 mt-4">
        {#each donutData as d}
          <div class="flex items-center gap-2">
            <span
              class="w-2.5 h-2.5 rounded-full shrink-0"
              style="background-color: {d.color};"
            ></span>
            <span class="text-[13px] text-gray-500">{d.label}</span>
            <span class="text-[14px] font-semibold text-[#0B182A] ml-auto"
              >{d.value}</span
            >
          </div>
        {/each}
      </div>
    </div>

    <!-- Metrics Cards -->
    <div class="flex flex-col gap-3.5">
      <div
        class="bg-white rounded-2xl px-5 py-4.5 border-amber-50 shadow flex items-center justify-between"
      >
        <div class="flex items-center gap-3.5">
          <div
            class="w-10.5 h-10.5 rounded-[10px] bg-blue-100 flex items-center justify-center shrink-0"
          >
            <Icons.Clock size={20} stroke="#3b82f6" />
          </div>
          <div>
            <p class="text-[13px] text-gray-500 mb-0.5">
              Average Response Time
            </p>
            <p class="text-[20px] font-bold text-[#0B182A]">
              2.4 <span class="text-[14px] font-normal text-gray-400">hrs</span>
            </p>
          </div>
        </div>
        <svg width="60" height="30" viewBox="0 0 60 30" class="shrink-0">
          <polyline
            points="0,25 10,18 20,22 30,10 40,15 50,8 60,12"
            fill="none"
            stroke="#3b82f6"
            stroke-width="2"
          />
        </svg>
      </div>

      <div
        class="bg-white rounded-2xl px-5 py-4.5 border-amber-50 shadow flex items-center justify-between"
      >
        <div class="flex items-center gap-3.5">
          <div
            class="w-10.5 h-10.5 rounded-[10px] bg-amber-100 flex items-center justify-center shrink-0"
          >
            <Icons.Users size={20} stroke="#f59e0b" />
          </div>
          <div>
            <p class="text-[13px] text-gray-500 mb-0.5">Active Agents</p>
            <p class="text-[20px] font-bold text-[#0B182A]">
              <span class="text-accent">28</span>/ 34
            </p>
          </div>
        </div>
      </div>

      <div
        class="bg-white rounded-2xl px-5 py-4.5 border-amber-50 shadow flex items-center justify-between"
      >
        <div class="flex items-center gap-3.5">
          <div
            class="w-10.5 h-10.5 rounded-[10px] bg-green-100 flex items-center justify-center shrink-0"
          >
            <Icons.CheckCircle size={20} stroke="#22c55e" />
          </div>
          <div>
            <p class="text-[13px] text-gray-500 mb-0.5">Resolution Rate</p>
            <p class="text-[20px] font-bold text-green-500">87.45%</p>
          </div>
        </div>
      </div>

      <div
        class="bg-white rounded-2xl px-5 py-4.5 border-amber-50 shadow flex items-center justify-between"
      >
        <div class="flex items-center gap-3.5">
          <div
            class="w-10.5 h-10.5 rounded-[10px] bg-amber-100 flex items-center justify-center shrink-0"
          >
            <Icons.Star size={20} stroke="#f59e0b" />
          </div>
          <div>
            <p class="text-[13px] text-gray-500 mb-0.5">
              Customer Satisfaction
            </p>
            <p class="text-[20px] font-bold text-accent">
              4.8<span class="text-[14px] font-normal text-gray-400">/5.0</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Recent Tickets -->
  <div class="bg-white rounded-2xl p-6 border-amber-50 shadow">
    <div class="flex justify-between items-start mb-5 flex-wrap gap-4">
      <div>
        <h3 class="text-[18px] font-semibold text-[#0B182A]">Recent Tickets</h3>
        <p class="text-[12px] text-gray-400 mt-0.5">
          Latest customer Support Request
        </p>
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <!-- Search -->
        <div
          class="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg max-w-40"
        >
          <Icons.Search size={16} stroke="#9ca3af" />
          <input
            type="text"
            placeholder="Search"
            class="text-[12px] outline-none border-none w-full text-gray-600 placeholder:text-gray-400"
          />
        </div>
        <!-- Filter chips -->
        {#each filters as f}
          <button
            onclick={() => (activeFilter = f)}
            class="px-4 py-1.5 rounded-full border text-[12px] cursor-pointer transition-all duration-150
                   {activeFilter === f
              ? 'bg-[linear-gradient(to_bottom,#0B182A,#021E44)] text-white border-[#0B182A]'
              : 'bg-white text-gray-500 border-gray-200 hover:border-[#0B182A]'}"
            >{f}</button
          >
        {/each}
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-sm border-collapse">
        <thead>
          <tr class="border-b border-gray-100">
            {#each ["TICKET ID", "ISSUE", "SLA", "PLACE", "ENGINEER", "STATUS", "PRIORITY", "DATE", "ACTIONS"] as col}
              <th
                class="text-left text-[11px] font-semibold text-gray-400 tracking-wide py-3 px-3 whitespace-nowrap"
                >{col}</th
              >
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each recentTickets as ticket}
            <tr
              class="border-b border-gray-50 hover:bg-gray-50 transition-colors"
            >
              <td class="py-3 px-3 text-accent font-medium text-[13px]"
                >{ticket.id}</td
              >
              <td class="py-3 px-3">
                <div class="text-[13px] text-gray-700 font-medium">
                  {ticket.issue}
                </div>
                <div class="text-[11px] text-gray-400">{ticket.sub}</div>
              </td>
              <td class="py-3 px-3">
                <span
                  class="text-[11px] font-semibold px-2.5 py-1 rounded-full
                             {ticket.sla === 'Breached'
                    ? 'bg-red-50 text-red-500'
                    : 'bg-green-50 text-green-600'}"
                >
                  {ticket.sla}
                </span>
              </td>
              <td class="py-3 px-3 text-[13px] text-gray-600">{ticket.place}</td
              >
              <td class="py-3 px-3 text-[13px] text-gray-600"
                >{ticket.engineer}</td
              >
              <td class="py-3 px-3">
                <span
                  class="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600"
                >
                  {ticket.status}
                </span>
              </td>
              <td class="py-3 px-3">
                <span
                  class="text-[11px] font-semibold px-2.5 py-1 rounded-full
                             {ticket.priority === 'High'
                    ? 'bg-red-50 text-red-500'
                    : ticket.priority === 'Medium'
                      ? 'bg-amber-50 text-amber-500'
                      : 'bg-green-50 text-green-600'}"
                >
                  {ticket.priority}
                </span>
              </td>
              <td class="py-3 px-3 text-[13px] text-gray-600 whitespace-nowrap"
                >{ticket.date}</td
              >
              <td class="py-3 px-3">
                <!-- svelte-ignore a11y_consider_explicit_label -->
                <button
                  class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#0B182A] transition-colors"
                >
                  <Icons.Eye size={16} />
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <!-- Table Footer -->
    <div
      class="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-border-light mt-2 gap-3"
    >
      <span class="text-[13px] text-gray-500">
        Showing <strong>1–9</strong> of 1,250 Tickets
      </span>
      <div class="flex items-center gap-1">
        {#each ["< Previous", "1", "2", "3", "120", "Next >"] as page}
          <button
            class="px-3 py-1.5 text-[12px] rounded-md border transition-colors
                   {page === '1'
              ? 'bg-[linear-gradient(to_bottom,#0B182A,#021E44)] text-white border-[#0B182A]'
              : 'bg-white text-gray-500 border-gray-200 hover:border-[#0B182A] hover:text-[#0B182A]'}
                   {page === '< Previous'
              ? 'opacity-40 cursor-not-allowed'
              : 'cursor-pointer'}"
            disabled={page === "< Previous"}>{page}</button
          >
        {/each}
      </div>
    </div>
  </div>
</div>
