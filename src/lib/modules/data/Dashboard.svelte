<script>
  import { onMount } from "svelte";

  let activeFilter = $state("All");
  const filters = ["All", "Open", "Pending", "Resolved", "New Tickets"];

  const stats = [
    {
      label: "Total Tickets",
      value: "1,250",
      trend: "+12%",
      trendDir: "up",
      color: "#183E58",
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
  <div class="grid grid-cols-5 gap-4">
    {#each stats as stat}
      <div
        class="bg-white rounded-2xl p-5 shadow border border-amber-50 flex flex-col gap-1 relative"
      >
        <div
          class="w-10 h-10 rounded-xl flex items-center justify-center mb-1"
          style="background-color: {stat.color}15;"
        >
          {#if stat.icon === "ticket"}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={stat.color}
              stroke-width="2"
              ><rect x="2" y="4" width="20" height="16" rx="2" /><path
                d="M2 10h20"
              /></svg
            >
          {:else if stat.icon === "open"}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={stat.color}
              stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg
            >
          {:else if stat.icon === "pending"}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={stat.color}
              stroke-width="2"
              ><circle cx="12" cy="12" r="10" /><polyline
                points="12 6 12 12 16 14"
              /></svg
            >
          {:else if stat.icon === "resolved"}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={stat.color}
              stroke-width="2"
              ><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline
                points="22 4 12 14.01 9 11.01"
              /></svg
            >
          {:else if stat.icon === "closed"}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={stat.color}
              stroke-width="2"
              ><rect x="3" y="3" width="18" height="18" rx="2" /><line
                x1="9"
                y1="9"
                x2="15"
                y2="15"
              /><line x1="15" y1="9" x2="9" y2="15" /></svg
            >
          {/if}
        </div>

        <span
          class="absolute top-4 right-4 text-[11px] font-semibold px-2 py-0.5 rounded-full
                     {stat.trendDir === 'up'
            ? 'text-green-600 bg-green-50'
            : 'text-red-500 bg-red-50'}"
        >
          {stat.trend}
        </span>

        <div class="text-[22px] font-bold text-[#183E58]">{stat.value}</div>
        <div class="text-[13px] text-gray-400">{stat.label}</div>
      </div>
    {/each}
  </div>

  <!-- Middle Section: Donut Chart + Metrics -->
  <div class="grid grid-cols-2 gap-6">
    <!-- Donut Chart Card -->
    <div class="bg-white rounded-2xl p-6 border-amber-50 shadow">
      <div class="flex justify-between items-start mb-5">
        <div>
          <h3 class="text-base font-semibold text-[#183E58]">
            Ticket Status Distribution
          </h3>
          <p class="text-[12px] text-gray-400 mt-0.5">
            Current Period Breakdown
          </p>
        </div>
        <select
          class="px-3 py-1.5 border border-gray-200 rounded-md text-[12px] text-green-600 bg-green-50 cursor-pointer outline-none font-[Poppins]"
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
            fill="#183E58">1,250</text
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
            <span class="text-[14px] font-semibold text-[#183E58] ml-auto"
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
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#3b82f6"
              stroke-width="2"
              ><circle cx="12" cy="12" r="10" /><polyline
                points="12 6 12 12 16 14"
              /></svg
            >
          </div>
          <div>
            <p class="text-[13px] text-gray-500 mb-0.5">
              Average Response Time
            </p>
            <p class="text-[20px] font-bold text-[#183E58]">
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
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f59e0b"
              stroke-width="2"
              ><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle
                cx="9"
                cy="7"
                r="4"
              /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path
                d="M16 3.13a4 4 0 010 7.75"
              /></svg
            >
          </div>
          <div>
            <p class="text-[13px] text-gray-500 mb-0.5">Active Agents</p>
            <p class="text-[20px] font-bold text-[#183E58]">
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
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#22c55e"
              stroke-width="2"
              ><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline
                points="22 4 12 14.01 9 11.01"
              /></svg
            >
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
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f59e0b"
              stroke-width="2"
              ><path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              /></svg
            >
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
        <h3 class="text-[18px] font-semibold text-[#183E58]">Recent Tickets</h3>
        <p class="text-[12px] text-gray-400 mt-0.5">
          Latest customer Support Request
        </p>
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <!-- Search -->
        <div
          class="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg max-w-40"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9ca3af"
            stroke-width="2"
            ><circle cx="11" cy="11" r="8" /><line
              x1="21"
              y1="21"
              x2="16.65"
              y2="16.65"
            /></svg
          >
          <input
            type="text"
            placeholder="Search"
            class="text-[12px] outline-none border-none w-full text-gray-600 placeholder:text-gray-400 font-[Poppins]"
          />
        </div>
        <!-- Filter chips -->
        {#each filters as f}
          <button
            onclick={() => (activeFilter = f)}
            class="px-4 py-1.5 rounded-full border text-[12px] font-[Poppins] cursor-pointer transition-all duration-150
                   {activeFilter === f
              ? 'bg-[#183E58] text-white border-[#183E58]'
              : 'bg-white text-gray-500 border-gray-200 hover:border-[#183E58]'}"
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
                  class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#183E58] transition-colors"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    ><path
                      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                    /><circle cx="12" cy="12" r="3" /></svg
                  >
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <!-- Table Footer -->
    <div
      class="flex items-center justify-between pt-4 border-t border-border-light mt-2"
    >
      <span class="text-[13px] text-gray-500">
        Showing <strong>1–9</strong> of 1,250 Tickets
      </span>
      <div class="flex items-center gap-1">
        {#each ["< Previous", "1", "2", "3", "120", "Next >"] as page}
          <button
            class="px-3 py-1.5 text-[12px] rounded-md border font-[Poppins] transition-colors
                   {page === '1'
              ? 'bg-[#183E58] text-white border-[#183E58]'
              : 'bg-white text-gray-500 border-gray-200 hover:border-[#183E58] hover:text-[#183E58]'}
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
