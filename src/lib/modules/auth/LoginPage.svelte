<script lang="ts">
  import { goto } from "$app/navigation";
  import Logo from "$lib/ui/Logo.svelte";
  import { toast } from "svelte-sonner";

  let loading = $state(false);

  let email = $state("admin@innoserve.com");
  let password = $state("sa");
  let rememberMe = $state(false);

  function handleLogin(e: any) {
    loading = true;
    e.preventDefault();

    console.log("Login attempted with:", { email, password, rememberMe });
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      loading = false;
      return;
    } else if (email !== "admin@innoserve.com" || password !== "sa") {
      toast.error("Invalid email or password.");
      loading = false;
      return;
    } else {
      toast.success("Login successful! Redirecting...");
      goto("/data");
      loading = false;
    }
  }
</script>

<div class="flex min-h-screen w-full">
  <!-- Left Side - Dark Background with Welcome Text -->
  <div
    class="flex-[0_0_45%] bg-[linear-gradient(135deg,#0f2b3d_0%,#183e58_40%,#1a3a52_100%)] flex items-end px-12.5 py-15 relative overflow-hidden"
  >
    <!-- Replaces ::before pseudo-element -->
    <div
      class="absolute top-[-50%] right-[-30%] w-[80%] h-[150%] rounded-[50%] bg-[radial-gradient(circle,rgba(255,255,255,0.03)_0%,transparent_70%)]"
    ></div>

    <div class="relative z-10">
      <p class="text-[32px] font-normal text-white leading-[1.35] italic">
        <em>
          Welcome.<br />
          Start your journey<br />
          now with our<br />
          management<br />
          system!
        </em>
      </p>
    </div>
  </div>

  <!-- Right Side - Login Form -->
  <div
    class="flex-[0_0_55%] flex items-center justify-center bg-[#faf9f6] p-10"
  >
    <div class="w-full max-w-100">
      <!-- Logo -->
      <div class="flex justify-center mb-10">
        <Logo />
      </div>

      <h2
        class="text-center text-[22px] font-bold text-[#183e58] mb-9 tracking-[1px]"
      >
        LOGIN
      </h2>

      <form class="flex flex-col gap-5">
        <div class="w-full">
          <input
            type="email"
            placeholder="E-mail"
            bind:value={email}
            class="w-full py-3.5 px-4.5 bg-[#ededed] border-none rounded-lg text-sm text-[#333] outline-none transition-all duration-200 placeholder:text-[#999] focus:bg-[#e3e3e3] focus:shadow-[0_0_0_2px_rgba(24,62,88,0.15)] font-[Poppins]"
          />
        </div>

        <div class="w-full">
          <input
            type="password"
            placeholder="Password"
            bind:value={password}
            class="w-full py-3.5 px-4.5 bg-[#ededed] border-none rounded-lg text-sm text-[#333] outline-none transition-all duration-200 placeholder:text-[#999] focus:bg-[#e3e3e3] focus:shadow-[0_0_0_2px_rgba(24,62,88,0.15)] font-[Poppins]"
          />
        </div>

        <div class="flex items-center justify-between">
          <label
            class="flex items-center gap-2 cursor-pointer text-[13px] text-[#666]"
          >
            <input
              type="checkbox"
              bind:checked={rememberMe}
              class="w-4 h-4 border-2 border-[#ccc] rounded-[3px] accent-[#183e58]"
            />
            <span>Remember me</span>
          </label>
          <a
            href="#"
            class="text-[13px] text-[#e87d1f] no-underline font-medium hover:underline"
          >
            Forget Password
          </a>
        </div>

        <button
          onclick={handleLogin}
          disabled={loading}
          class="w-full py-3.5 mt-2 bg-[#183e58] hover:bg-[#1e4d6e] text-white border-none rounded-lg text-[15px] font-semibold tracking-[1px] cursor-pointer transition-colors duration-200 font-[Poppins]"
        >
          LOGIN
        </button>
      </form>
    </div>
  </div>
</div>
