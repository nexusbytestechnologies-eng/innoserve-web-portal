import { gqlRequest } from "$lib/api/graphql";

// ── Types ──────────────────────────────────────────────────────────────────

export interface EngineerProfile {
  id: string;
  userId: string;
  referenceId: string | null;
  userName: string | null;
  userEmail: string | null;
  userPhone: string | null;
  addressState: string | null;
  addressCity: string | null;
  addressPincode: string | null;
  assignedState: string | null;
  profilePhotoUrl: string | null;
  aadhaarUrl: string | null;
  panCardUrl: string | null;
  dlUrl: string | null;
  documentsStatus: string;
  bankAccountNumber: string | null;
  ifscCode: string | null;
  accountHolderName: string | null;
  cancelChequeUrl: string | null;
  createdAt: string;
}

// ── Queries ────────────────────────────────────────────────────────────────

const FETCH_ENGINEER_PROFILES = `
  query {
    engineerProfiles {
      id userId referenceId
      userName userEmail userPhone
      addressState addressCity assignedState
      documentsStatus profilePhotoUrl
      aadhaarUrl panCardUrl dlUrl cancelChequeUrl
      accountHolderName createdAt
    }
  }
`;

// ── Functions ──────────────────────────────────────────────────────────────

export async function fetchEngineerProfiles(): Promise<EngineerProfile[]> {
  const data = await gqlRequest<{ engineerProfiles: EngineerProfile[] }>(FETCH_ENGINEER_PROFILES);
  return data.engineerProfiles;
}
