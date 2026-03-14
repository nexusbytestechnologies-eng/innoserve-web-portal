<script>
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";

  let progress = $state(0);
  let showText = $state(false);
  let showSubtext = $state(false);
  let fadeOut = $state(false);

  onMount(() => {
    setTimeout(() => (showText = true), 400);
    setTimeout(() => (showSubtext = true), 800);

    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          fadeOut = true;
          setTimeout(() => {
            toast.success("Redirecting to login page...");
            goto("/auth");
          }, 600);
        }, 300);
      }
    }, 200);

    return () => clearInterval(interval);
  });
</script>

<div
  class="fixed inset-0 flex items-center justify-center
         bg-[linear-gradient(145deg,#0d2a3d_0%,#183E58_35%,#1a4565_65%,#0f2d42_100%)]
         font-[Poppins] overflow-hidden z-9999
         transition-[opacity,transform] duration-600 ease-in-out"
  class:opacity-0={fadeOut}
  class:scale-105={fadeOut}
>
  <!-- Animated background particles -->
  <div class="absolute inset-0 overflow-hidden">
    <div
      class="absolute rounded-full bg-[rgba(232,125,31,0.06)] animate-[float_20s_0s_infinite_ease-in-out]
                w-75 h-75 -top-25 -right-20"
    ></div>
    <div
      class="absolute rounded-full bg-[rgba(232,125,31,0.06)] animate-[float_20s_-5s_infinite_ease-in-out]
                w-50 h-50 -bottom-15 -left-10"
    ></div>
    <div
      class="absolute rounded-full bg-[rgba(255,255,255,0.02)] animate-[float_20s_-10s_infinite_ease-in-out]
                w-37.5 h-37.5 top-[30%] left-[10%]"
    ></div>
    <div
      class="absolute rounded-full bg-[rgba(232,125,31,0.04)] animate-[float_20s_-3s_infinite_ease-in-out]
                w-25 h-25 bottom-[20%] right-[15%]"
    ></div>
    <div
      class="absolute rounded-full bg-[rgba(255,255,255,0.015)] animate-[float_20s_-7s_infinite_ease-in-out]
                w-62.5 h-62.5 top-[50%] left-[60%]"
    ></div>
    <div
      class="absolute rounded-full bg-[rgba(232,125,31,0.05)] animate-[float_20s_-12s_infinite_ease-in-out]
                w-20 h-20 top-[15%] left-[45%]"
    ></div>
  </div>

  <!-- Glow effect behind logo -->
  <div
    class="absolute w-100 h-100 rounded-full
              bg-[radial-gradient(circle,rgba(232,125,31,0.08)_0%,transparent_70%)]
              animate-[pulse-glow_3s_ease-in-out_infinite]"
  ></div>

  <!-- Main content -->
  <div class="flex flex-col items-center gap-8 relative z-2">
    <!-- Animated Logo -->
    <div
      class="relative w-25 h-25 flex items-center justify-center
                animate-[logo-enter_0.8s_cubic-bezier(0.16,1,0.3,1)_forwards]"
    >
      <!-- Ring -->
      <div class="absolute inset-0">
        <svg
          width="100"
          height="100"
          viewBox="0 0 100 100"
          class="w-full h-full"
        >
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="rgba(232,125,31,0.15)"
            stroke-width="2"
          />
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="#E87D1F"
            stroke-width="2.5"
            stroke-dasharray="289.03"
            stroke-dashoffset="289.03"
            stroke-linecap="round"
            class="ring-progress"
          />
        </svg>
      </div>

      <!-- Icon -->
      <div class="relative z-1 drop-shadow-[0_4px_20px_rgba(232,125,31,0.3)]">
        <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
          <rect
            width="52"
            height="52"
            rx="12"
            fill="#E87D1F"
            class="logo-rect"
          />
          <path
            d="M14 26L26 14L38 26L26 38L14 26Z"
            fill="#183E58"
            class="logo-diamond"
          />
          <path
            d="M20 26L26 20L32 26L26 32L20 26Z"
            fill="white"
            class="logo-inner"
          />
        </svg>
      </div>
    </div>

    <!-- Brand Name -->
    <div
      class="text-center transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)]"
      class:opacity-0={!showText}
      class:translate-y-5={!showText}
      class:opacity-100={showText}
      class:translate-y-0={showText}
    >
      <h1 class="text-[28px] font-extrabold tracking-[4px] leading-none m-0">
        <span class="text-white">INNO</span><span class="text-[#E87D1F]"
          >SERVE</span
        >
      </h1>
      <h2
        class="text-[28px] font-extrabold tracking-[4px] text-white mt-0.5 leading-none"
      >
        TECHSOL
      </h2>
      <p class="text-[9px] text-white/45 tracking-[2px] mt-2">
        YOUR SUCCESS IS <span class="text-[#E87D1F]">OUR GOAL</span>
      </p>
    </div>

    <!-- Loading indicator -->
    <div
      class="flex flex-col items-center gap-3.5 w-55
             transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
      class:opacity-0={!showSubtext}
      class:translate-y-[15px]={!showSubtext}
      class:opacity-100={showSubtext}
      class:translate-y-0={showSubtext}
    >
      <!-- Progress bar -->
      <div
        class="w-full h-0.75 bg-white/8 rounded-sm overflow-visible relative"
      >
        <div
          class="h-full bg-linear-to-r from-[#E87D1F] to-[#f5a623] rounded-sm transition-[width] duration-300 ease-linear relative"
          style="width: {Math.min(progress, 100)}%"
        ></div>
        <div
          class="absolute top-1/2 w-2 h-2 rounded-full bg-[#E87D1F]
                 -translate-x-1/2 -translate-y-1/2
                 shadow-[0_0_12px_rgba(232,125,31,0.6),0_0_24px_rgba(232,125,31,0.3)]
                 transition-[left] duration-300 ease-linear"
          style="left: {Math.min(progress, 100)}%"
        ></div>
      </div>

      <p
        class="text-[12px] text-white/40 tracking-[1px] m-0 font-light min-h-4.5"
      >
        {#if progress < 30}
          Initializing system...
        {:else if progress < 60}
          Loading modules...
        {:else if progress < 90}
          Preparing dashboard...
        {:else}
          Ready!
        {/if}
      </p>
    </div>
  </div>

  <!-- Bottom decoration -->
  <div class="absolute bottom-0 left-0 right-0 px-[20%]">
    <div
      class="h-0.75 bg-linear-to-r from-transparent via-[rgba(232,125,31,0.3)] to-transparent rounded-xs"
    ></div>
  </div>
</div>

<style>
  @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap");

  @keyframes float {
    0%,
    100% {
      transform: translate(0, 0) scale(1);
    }
    25% {
      transform: translate(30px, -40px) scale(1.1);
    }
    50% {
      transform: translate(-20px, 20px) scale(0.95);
    }
    75% {
      transform: translate(15px, 35px) scale(1.05);
    }
  }
  @keyframes pulse-glow {
    0%,
    100% {
      transform: scale(1);
      opacity: 0.6;
    }
    50% {
      transform: scale(1.2);
      opacity: 1;
    }
  }
  @keyframes logo-enter {
    0% {
      transform: scale(0) rotate(-180deg);
      opacity: 0;
    }
    100% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
  }
  @keyframes ring-draw {
    0% {
      stroke-dashoffset: 289.03;
      transform: rotate(0deg);
    }
    50% {
      stroke-dashoffset: 72;
    }
    100% {
      stroke-dashoffset: 289.03;
      transform: rotate(360deg);
    }
  }
  @keyframes rect-pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.85;
    }
  }
  @keyframes diamond-rotate {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  @keyframes inner-pulse {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(0.85);
    }
  }

  .ring-progress {
    animation: ring-draw 2s ease-in-out infinite;
    transform-origin: center;
  }
  .logo-rect {
    animation: rect-pulse 2s ease-in-out infinite;
  }
  .logo-diamond {
    animation: diamond-rotate 8s linear infinite;
    transform-origin: 26px 26px;
  }
  .logo-inner {
    animation: inner-pulse 2s ease-in-out infinite;
    transform-origin: 26px 26px;
  }

  @media (max-width: 640px) {
    h1,
    h2 {
      font-size: 22px !important;
      letter-spacing: 3px !important;
    }
    p.text-\[9px\] {
      font-size: 8px !important;
    }
    .w-\[220px\] {
      width: 180px !important;
    }
    .w-\[400px\] {
      width: 250px !important;
      height: 250px !important;
    }
  }
</style>
