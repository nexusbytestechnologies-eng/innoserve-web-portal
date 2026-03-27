import { gqlRequest } from "$lib/api/graphql";
import { uploadFile } from "$lib/api/upload";

// ── Input shape (mirrors the frontend form) ─────────────────────────────────

export interface EngineerOnboardingFormData {
  // Basic Details
  fullName: string;
  phone: string;
  email: string;
  state: string;
  city: string;
  pincode: string;
  profilePhoto?: File;        // optional

  // KYC Documents (File objects from the form)
  aadhaarFile: File;
  panFile: File;
  dlFile: File;

  // Bank Details
  accountHolderName: string;
  accountNumber: string;
  ifsc: string;
  cancelChequeFile: File;
}

// ── GraphQL input / response types ──────────────────────────────────────────

export interface EngineerOnboardingInput {
  fullName: string;
  phone: string;
  email: string;
  state: string;
  city: string;
  pincode: string;
  profilePhotoId?: number;
  aadhaarFileId: number;
  panFileId: number;
  dlFileId: number;
  accountHolderName: string;
  accountNumber: string;
  ifsc: string;
  cancelChequeFileId: number;
}

export interface EngineerOnboardingResult {
  id: string;
  referenceId: string;
  status: string;
  createdAt: string;
}

// ── Mutation ─────────────────────────────────────────────────────────────────

const SUBMIT_ENGINEER_ONBOARDING = `
  mutation SubmitEngineerOnboarding($input: EngineerOnboardingInput!) {
    submitEngineerOnboarding(input: $input) {
      id
      referenceId
      status
      createdAt
    }
  }
`;

// ── Main function ────────────────────────────────────────────────────────────
//
// Flow:
//   1. Upload each File object → receive fileId from server
//   2. Build the GraphQL input (text fields + fileIds)
//   3. Run the mutation → return { id, referenceId, status, createdAt }

export async function submitEngineerOnboarding(
  formData: EngineerOnboardingFormData,
): Promise<EngineerOnboardingResult> {
  // Upload all documents in parallel (profile photo is optional)
  const [aadhaarFileId, panFileId, dlFileId, cancelChequeFileId, profilePhotoId] =
    await Promise.all([
      uploadFile(formData.aadhaarFile),
      uploadFile(formData.panFile),
      uploadFile(formData.dlFile),
      uploadFile(formData.cancelChequeFile),
      formData.profilePhoto ? uploadFile(formData.profilePhoto) : Promise.resolve(undefined),
    ]);

  const input: EngineerOnboardingInput = {
    fullName: formData.fullName,
    phone: formData.phone,
    email: formData.email,
    state: formData.state,
    city: formData.city,
    pincode: formData.pincode,
    accountHolderName: formData.accountHolderName,
    accountNumber: formData.accountNumber,
    ifsc: formData.ifsc,
    aadhaarFileId,
    panFileId,
    dlFileId,
    cancelChequeFileId,
    ...(profilePhotoId ? { profilePhotoId } : {}),
  };

  const data = await gqlRequest<{ submitEngineerOnboarding: EngineerOnboardingResult }>(
    SUBMIT_ENGINEER_ONBOARDING,
    { input },
  );

  return data.submitEngineerOnboarding;
}
