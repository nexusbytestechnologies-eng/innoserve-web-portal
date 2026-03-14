<script>
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";

  onMount(() => {
    toast.success("Redirecting to login page...");
    goto("/auth");
  });
</script>
