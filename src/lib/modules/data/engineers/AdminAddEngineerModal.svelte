<script lang="ts">
  import { toast } from "svelte-sonner";
  import { submitEngineerOnboarding } from "$lib/modules/onboarding/engineer-api";
  import { invalidate } from "$lib/stores/query";

  let { onClose }: { onClose: () => void } = $props();

  const STEPS = [
    { title: "Basic Details", subtitle: "Personal information & address" },
    { title: "KYC Documents", subtitle: "Identity verification" },
    { title: "Bank Details", subtitle: "Payment information" },
    { title: "Review & Submit", subtitle: "Confirm and submit" },
  ];

  const INDIAN_STATES = [
    "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
    "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
    "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
    "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
    "Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi (NCT)",
    "Chandigarh","Puducherry","Ladakh","Jammu & Kashmir","Lakshadweep",
    "Dadra & Nagar Haveli and Daman & Diu","Andaman & Nicobar Islands",
  ];

  let currentStep = $state(0);
  let isSubmitting = $state(false);

  let form = $state({
    fullName: "",
    phone: "",
    email: "",
    state: "",
    city: "",
    pincode: "",
    profilePhoto: null as File | null,
    profilePhotoPreview: "",
    aadhaarFile: null as File | null,
    panFile: null as File | null,
    dlFile: null as File | null,
    accountHolderName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifsc: "",
    cancelChequeFile: null as File | null,
  });

  let errors = $state<Record<string, string>>({});

  const ALLOWED_DOC_TYPES = ["image/jpeg", "image/png", "application/pdf"];
  const MAX_DOC_MB = 5;
  const MAX_PHOTO_MB = 2;

  function validateFile(
    file: File | null,
    label: string,
    opts: { required?: boolean; maxMB?: number; types?: string[] } = {},
  ): string | null {
    const { required = true, maxMB = MAX_DOC_MB, types = ALLOWED_DOC_TYPES } = opts;
    if (!file) return required ? `${label} is required` : null;
    if (!types.includes(file.type))
      return `${label}: only JPG, PNG, PDF files allowed`;
    if (file.size > maxMB * 1024 * 1024)
      return `${label}: file must be under ${maxMB}MB`;
    return null;
  }

  function validateStep(step: number): boolean {
    errors = {};

    if (step === 0) {
      const name = form.fullName.trim();
      if (!name) errors.fullName = "Full name is required";
      else if (!/^[A-Za-z\s.\-']+$/.test(name)) errors.fullName = "Letters, spaces, dots, hyphens only";
      else if (name.length < 2 || name.length > 60) errors.fullName = "Between 2 and 60 characters";

      const phone = form.phone.trim();
      if (!phone) errors.phone = "Phone number is required";
      else if (!/^[6-9]\d{9}$/.test(phone)) errors.phone = "Valid 10-digit Indian mobile number";

      const email = form.email.trim();
      if (!email) errors.email = "Email address is required";
      else if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email))
        errors.email = "Enter a valid email address";

      if (!form.state) errors.state = "Please select a state";

      const city = form.city.trim();
      if (!city) errors.city = "City is required";
      else if (!/^[A-Za-z\s.\-]+$/.test(city)) errors.city = "Letters, spaces, dots, hyphens only";
      else if (city.length < 2 || city.length > 50) errors.city = "Between 2 and 50 characters";

      const pin = form.pincode.trim();
      if (!pin) errors.pincode = "Pincode is required";
      else if (!/^[1-9]\d{5}$/.test(pin)) errors.pincode = "Valid 6-digit pincode";

      if (form.profilePhoto) {
        const err = validateFile(form.profilePhoto, "Profile photo", { required: false, maxMB: MAX_PHOTO_MB, types: ["image/jpeg","image/png"] });
        if (err) errors.profilePhoto = err;
      }
    }

    if (step === 1) {
      const a = validateFile(form.aadhaarFile, "Aadhaar card");
      if (a) errors.aadhaarFile = a;
      const p = validateFile(form.panFile, "PAN card");
      if (p) errors.panFile = p;
      const d = validateFile(form.dlFile, "Driving license");
      if (d) errors.dlFile = d;
    }

    if (step === 2) {
      const holder = form.accountHolderName.trim();
      if (!holder) errors.accountHolderName = "Account holder name is required";
      else if (!/^[A-Za-z\s.\-']+$/.test(holder)) errors.accountHolderName = "Letters only";
      else if (holder.length < 2 || holder.length > 80) errors.accountHolderName = "Between 2 and 80 characters";

      const acc = form.accountNumber.trim();
      if (!acc) errors.accountNumber = "Account number is required";
      else if (!/^\d{9,18}$/.test(acc)) errors.accountNumber = "9–18 digits";

      if (!form.confirmAccountNumber.trim()) errors.confirmAccountNumber = "Please confirm account number";
      else if (form.accountNumber !== form.confirmAccountNumber) errors.confirmAccountNumber = "Account numbers do not match";

      const ifsc = form.ifsc.trim().toUpperCase();
      if (!ifsc) errors.ifsc = "IFSC code is required";
      else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) errors.ifsc = "Invalid IFSC (e.g. SBIN0001234)";

      const cheq = validateFile(form.cancelChequeFile, "Cancelled cheque");
      if (cheq) errors.cancelChequeFile = cheq;
    }

    return Object.keys(errors).length === 0;
  }

  function nextStep() {
    if (validateStep(currentStep)) currentStep = Math.min(currentStep + 1, STEPS.length - 1);
  }

  function prevStep() {
    currentStep = Math.max(currentStep - 1, 0);
  }

  async function handleSubmit() {
    isSubmitting = true;
    try {
      const result = await submitEngineerOnboarding({
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
        state: form.state,
        city: form.city,
        pincode: form.pincode,
        profilePhoto: form.profilePhoto ?? undefined,
        aadhaarFile: form.aadhaarFile!,
        panFile: form.panFile!,
        dlFile: form.dlFile!,
        accountHolderName: form.accountHolderName,
        accountNumber: form.accountNumber,
        ifsc: form.ifsc.toUpperCase(),
        cancelChequeFile: form.cancelChequeFile!,
      });
      invalidate('engineers');
      toast.success(`Engineer added — Ref: ${result.referenceId}`);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed. Please try again.");
    } finally {
      isSubmitting = false;
    }
  }

  function fileLabel(file: File | null): string {
    return file ? file.name : "No file chosen";
  }

  const inp = "w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-[13px] text-gray-700 outline-none focus:border-[#0B182A] transition-colors bg-white";
  const lbl = "text-[11px] font-semibold text-gray-500 uppercase tracking-wide";
  const err = "text-[11px] text-red-500 mt-1";
</script>

<!-- Backdrop -->
<div
  class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
  role="presentation"
  onclick={onClose}
>
  <div
    class="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[92vh] flex flex-col"
    role="dialog"
    aria-modal="true"
    aria-label="Add Engineer"
    onclick={(e) => e.stopPropagation()}
  >
    <!-- Modal Header -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
      <div>
        <h2 class="text-[16px] font-semibold text-[#0B182A]">Add Engineer</h2>
        <p class="text-[12px] text-gray-400 mt-0.5">Fill all details to register a new field engineer</p>
      </div>
      <button
        onclick={onClose}
        class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
        aria-label="Close"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <!-- Step Indicator -->
    <div class="px-6 pt-4 pb-3 border-b border-gray-100 shrink-0">
      <div class="flex items-center">
        {#each STEPS as step, i}
          <div class="flex items-center {i < STEPS.length - 1 ? 'flex-1' : ''}">
            <div class="flex flex-col items-center">
              <div
                class="w-7 h-7 rounded-full flex items-center justify-center font-semibold text-[12px] shrink-0 transition-colors"
                style={i === currentStep
                  ? "background:#E87D1F;color:#fff"
                  : i < currentStep
                    ? "background:#16a34a;color:#fff"
                    : "background:#e5e7eb;color:#9ca3af"}
              >
                {#if i < currentStep}
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                  </svg>
                {:else}
                  {i + 1}
                {/if}
              </div>
              <span class="text-[10px] mt-1 hidden sm:block whitespace-nowrap font-medium"
                style={i === currentStep ? "color:#E87D1F" : i < currentStep ? "color:#16a34a" : "color:#9ca3af"}>
                {step.title}
              </span>
            </div>
            {#if i < STEPS.length - 1}
              <div class="flex-1 h-px mx-2" style={i < currentStep ? "background:#16a34a" : "background:#e5e7eb"}></div>
            {/if}
          </div>
        {/each}
      </div>
      <p class="text-[12px] text-gray-500 mt-2 sm:hidden">{STEPS[currentStep].title} · Step {currentStep + 1} of {STEPS.length}</p>
    </div>

    <!-- Step Content -->
    <div class="overflow-y-auto flex-1 px-6 py-5">

      <!-- Step 0: Basic Details -->
      {#if currentStep === 0}
        <div class="flex flex-col gap-4">
          <!-- Profile Photo -->
          <div class="flex items-center gap-4 pb-4 border-b border-gray-100">
            <div class="w-16 h-16 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-300 shrink-0">
              {#if form.profilePhotoPreview}
                <img src={form.profilePhotoPreview} alt="Preview" class="w-full h-full object-cover" />
              {:else}
                <svg class="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              {/if}
            </div>
            <div>
              <label for="adminPhotoInput" class="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] text-gray-600 hover:bg-gray-50 transition-colors">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                </svg>
                {form.profilePhoto ? "Change Photo" : "Upload Profile Photo"}
              </label>
              <input
                type="file" id="adminPhotoInput" class="hidden" accept="image/jpeg,image/png"
                onchange={(e) => {
                  const f = (e.target as HTMLInputElement).files?.[0] ?? null;
                  form.profilePhoto = f;
                  if (f) {
                    const reader = new FileReader();
                    reader.onload = (ev) => { form.profilePhotoPreview = ev.target?.result as string; };
                    reader.readAsDataURL(f);
                  } else {
                    form.profilePhotoPreview = "";
                  }
                }}
              />
              <p class="text-[11px] text-gray-400 mt-1">Optional · JPG, PNG up to 2 MB</p>
              {#if errors.profilePhoto}<p class={err}>{errors.profilePhoto}</p>{/if}
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Full Name -->
            <label class="flex flex-col gap-1.5">
              <span class={lbl}>Full Name <span class="text-red-400">*</span></span>
              <input
                type="text" bind:value={form.fullName}
                class="{inp} {errors.fullName ? 'border-red-300' : ''}"
                placeholder="e.g. Rajesh Kumar"
                oninput={(e) => { const el = e.target as HTMLInputElement; el.value = el.value.replace(/[^A-Za-z\s.\-']/g, ""); form.fullName = el.value; }}
              />
              {#if errors.fullName}<span class={err}>{errors.fullName}</span>{/if}
            </label>

            <!-- Phone -->
            <label class="flex flex-col gap-1.5">
              <span class={lbl}>Phone Number <span class="text-red-400">*</span></span>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-[13px] font-medium select-none">+91</span>
                <input
                  type="tel" bind:value={form.phone}
                  class="{inp} {errors.phone ? 'border-red-300' : ''} pl-11"
                  placeholder="9876543210" maxlength="10"
                  oninput={(e) => { const el = e.target as HTMLInputElement; el.value = el.value.replace(/\D/g, ""); form.phone = el.value; }}
                />
              </div>
              {#if errors.phone}<span class={err}>{errors.phone}</span>{/if}
            </label>
          </div>

          <!-- Email -->
          <label class="flex flex-col gap-1.5">
            <span class={lbl}>Email Address <span class="text-red-400">*</span></span>
            <input
              type="email" bind:value={form.email}
              class="{inp} {errors.email ? 'border-red-300' : ''}"
              placeholder="engineer@example.com"
            />
            {#if errors.email}<span class={err}>{errors.email}</span>{/if}
          </label>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <!-- State -->
            <label class="flex flex-col gap-1.5">
              <span class={lbl}>State <span class="text-red-400">*</span></span>
              <select bind:value={form.state} class="{inp} {errors.state ? 'border-red-300' : ''}">
                <option value="">— Select —</option>
                {#each INDIAN_STATES as s}
                  <option value={s}>{s}</option>
                {/each}
              </select>
              {#if errors.state}<span class={err}>{errors.state}</span>{/if}
            </label>

            <!-- City -->
            <label class="flex flex-col gap-1.5">
              <span class={lbl}>City <span class="text-red-400">*</span></span>
              <input
                type="text" bind:value={form.city}
                class="{inp} {errors.city ? 'border-red-300' : ''}"
                placeholder="e.g. Mumbai"
              />
              {#if errors.city}<span class={err}>{errors.city}</span>{/if}
            </label>

            <!-- Pincode -->
            <label class="flex flex-col gap-1.5">
              <span class={lbl}>Pincode <span class="text-red-400">*</span></span>
              <input
                type="text" bind:value={form.pincode}
                class="{inp} {errors.pincode ? 'border-red-300' : ''}"
                placeholder="400001" maxlength="6"
                oninput={(e) => { const el = e.target as HTMLInputElement; el.value = el.value.replace(/\D/g, ""); form.pincode = el.value; }}
              />
              {#if errors.pincode}<span class={err}>{errors.pincode}</span>{/if}
            </label>
          </div>
        </div>

      <!-- Step 1: KYC Documents -->
      {:else if currentStep === 1}
        <div class="flex flex-col gap-5">
          {#each [
            { key: "aadhaarFile", label: "Aadhaar Card", hint: "Front + back page · JPG, PNG, PDF up to 5 MB" },
            { key: "panFile",     label: "PAN Card",     hint: "Clear photo or scan · JPG, PNG, PDF up to 5 MB" },
            { key: "dlFile",      label: "Driving License", hint: "Both sides · JPG, PNG, PDF up to 5 MB" },
          ] as doc}
            <div class="flex flex-col gap-1.5">
              <span class={lbl}>{doc.label} <span class="text-red-400">*</span></span>
              <label
                class="flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-colors
                       {(errors as Record<string,string>)[doc.key] ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-[#0B182A] bg-gray-50'}"
              >
                <svg class="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <div class="flex-1 min-w-0">
                  <p class="text-[12px] font-medium text-gray-700 truncate">
                    {fileLabel((form as Record<string,unknown>)[doc.key] as File | null)}
                  </p>
                  <p class="text-[11px] text-gray-400 mt-0.5">{doc.hint}</p>
                </div>
                <input
                  type="file" class="hidden" accept=".jpg,.jpeg,.png,.pdf"
                  onchange={(e) => {
                    (form as Record<string,unknown>)[doc.key] = (e.target as HTMLInputElement).files?.[0] ?? null;
                  }}
                />
              </label>
              {#if (errors as Record<string,string>)[doc.key]}
                <span class={err}>{(errors as Record<string,string>)[doc.key]}</span>
              {/if}
            </div>
          {/each}
        </div>

      <!-- Step 2: Bank Details -->
      {:else if currentStep === 2}
        <div class="flex flex-col gap-4">
          <label class="flex flex-col gap-1.5">
            <span class={lbl}>Account Holder Name <span class="text-red-400">*</span></span>
            <input
              type="text" bind:value={form.accountHolderName}
              class="{inp} {errors.accountHolderName ? 'border-red-300' : ''}"
              placeholder="As per bank records"
            />
            {#if errors.accountHolderName}<span class={err}>{errors.accountHolderName}</span>{/if}
          </label>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label class="flex flex-col gap-1.5">
              <span class={lbl}>Account Number <span class="text-red-400">*</span></span>
              <input
                type="text" bind:value={form.accountNumber}
                class="{inp} {errors.accountNumber ? 'border-red-300' : ''}"
                placeholder="9–18 digits"
                oninput={(e) => { const el = e.target as HTMLInputElement; el.value = el.value.replace(/\D/g, ""); form.accountNumber = el.value; }}
              />
              {#if errors.accountNumber}<span class={err}>{errors.accountNumber}</span>{/if}
            </label>
            <label class="flex flex-col gap-1.5">
              <span class={lbl}>Confirm Account Number <span class="text-red-400">*</span></span>
              <input
                type="text" bind:value={form.confirmAccountNumber}
                class="{inp} {errors.confirmAccountNumber ? 'border-red-300' : ''}"
                placeholder="Re-enter account number"
                oninput={(e) => { const el = e.target as HTMLInputElement; el.value = el.value.replace(/\D/g, ""); form.confirmAccountNumber = el.value; }}
              />
              {#if errors.confirmAccountNumber}<span class={err}>{errors.confirmAccountNumber}</span>{/if}
            </label>
          </div>

          <label class="flex flex-col gap-1.5">
            <span class={lbl}>IFSC Code <span class="text-red-400">*</span></span>
            <input
              type="text" bind:value={form.ifsc}
              class="{inp} {errors.ifsc ? 'border-red-300' : ''} uppercase"
              placeholder="e.g. SBIN0001234" maxlength="11"
              oninput={(e) => { const el = e.target as HTMLInputElement; el.value = el.value.toUpperCase().replace(/[^A-Z0-9]/g, ""); form.ifsc = el.value; }}
            />
            {#if errors.ifsc}<span class={err}>{errors.ifsc}</span>{/if}
          </label>

          <!-- Cancelled Cheque -->
          <div class="flex flex-col gap-1.5">
            <span class={lbl}>Cancelled Cheque / Passbook <span class="text-red-400">*</span></span>
            <label class="flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-colors
                         {errors.cancelChequeFile ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-[#0B182A] bg-gray-50'}">
              <svg class="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <div class="flex-1 min-w-0">
                <p class="text-[12px] font-medium text-gray-700 truncate">{fileLabel(form.cancelChequeFile)}</p>
                <p class="text-[11px] text-gray-400 mt-0.5">JPG, PNG, PDF up to 5 MB</p>
              </div>
              <input
                type="file" class="hidden" accept=".jpg,.jpeg,.png,.pdf"
                onchange={(e) => { form.cancelChequeFile = (e.target as HTMLInputElement).files?.[0] ?? null; }}
              />
            </label>
            {#if errors.cancelChequeFile}<span class={err}>{errors.cancelChequeFile}</span>{/if}
          </div>
        </div>

      <!-- Step 3: Review & Submit -->
      {:else if currentStep === 3}
        <div class="flex flex-col gap-4">
          <!-- Personal -->
          <div class="bg-gray-50 rounded-xl p-4">
            <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-3">Personal Details</p>
            <div class="grid grid-cols-2 gap-x-6 gap-y-2.5">
              {#each [
                ["Name", form.fullName],
                ["Phone", "+91 " + form.phone],
                ["Email", form.email],
                ["State", form.state],
                ["City", form.city],
                ["Pincode", form.pincode],
              ] as [label, value]}
                <div>
                  <p class="text-[10px] text-gray-400 uppercase tracking-wide">{label}</p>
                  <p class="text-[13px] text-gray-700 font-medium mt-0.5">{value || "—"}</p>
                </div>
              {/each}
            </div>
          </div>

          <!-- Documents -->
          <div class="bg-gray-50 rounded-xl p-4">
            <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-3">KYC Documents</p>
            <div class="flex flex-col gap-2">
              {#each [
                ["Aadhaar Card", form.aadhaarFile],
                ["PAN Card", form.panFile],
                ["Driving License", form.dlFile],
              ] as [label, file]}
                <div class="flex items-center justify-between">
                  <span class="text-[12px] text-gray-600">{label}</span>
                  {#if file}
                    <span class="flex items-center gap-1 text-[12px] text-green-600 font-medium">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                      </svg>
                      {(file as File).name}
                    </span>
                  {:else}
                    <span class="text-[12px] text-red-400">Missing</span>
                  {/if}
                </div>
              {/each}
            </div>
          </div>

          <!-- Bank -->
          <div class="bg-gray-50 rounded-xl p-4">
            <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-3">Bank Details</p>
            <div class="grid grid-cols-2 gap-x-6 gap-y-2.5">
              {#each [
                ["Account Holder", form.accountHolderName],
                ["Account Number", form.accountNumber],
                ["IFSC Code", form.ifsc.toUpperCase()],
                ["Cancelled Cheque", form.cancelChequeFile ? (form.cancelChequeFile as File).name : "—"],
              ] as [label, value]}
                <div>
                  <p class="text-[10px] text-gray-400 uppercase tracking-wide">{label}</p>
                  <p class="text-[13px] text-gray-700 font-medium mt-0.5 truncate">{value || "—"}</p>
                </div>
              {/each}
            </div>
          </div>

          <p class="text-[12px] text-gray-500 text-center">
            Documents will be uploaded and the application submitted for review.
          </p>
        </div>
      {/if}
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between px-6 py-4 border-t border-gray-100 shrink-0">
      <button
        type="button"
        onclick={prevStep}
        disabled={currentStep === 0}
        class="px-4 py-2.5 text-[13px] text-gray-600 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Back
      </button>

      {#if currentStep < STEPS.length - 1}
        <button
          type="button"
          onclick={nextStep}
          class="px-5 py-2.5 text-[13px] text-white font-semibold bg-[linear-gradient(to_bottom,#0B182A,#021E44)] rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
        >
          Next
        </button>
      {:else}
        <button
          type="button"
          onclick={handleSubmit}
          disabled={isSubmitting}
          class="px-5 py-2.5 text-[13px] text-white font-semibold bg-[linear-gradient(to_bottom,#0B182A,#021E44)] rounded-lg hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-60"
        >
          {isSubmitting ? "Submitting…" : "Submit"}
        </button>
      {/if}
    </div>
  </div>
</div>
