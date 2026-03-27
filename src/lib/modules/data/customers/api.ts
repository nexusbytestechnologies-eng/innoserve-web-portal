import { gqlRequest } from "$lib/api/graphql";

// ── Types ──────────────────────────────────────────────────────────────────

export interface Customer {
  id: string;
  companyName: string;
  contactPersonName: string;
  email: string;
  phone: string;
  secondaryContactName: string | null;
  secondaryContactEmail: string | null;
  secondaryContactPhone: string | null;
  addressState: string | null;
  addressCity: string | null;
  addressPincode: string | null;
  userId: string | null;
  status: string;
  approvedBy: string | null;
  approvedAt: string | null;
  author: string | null;
  createdAt: string;
}

export interface CreateCustomerInput {
  companyName: string;
  contactPersonName: string;
  email?: string;
  phone?: string;
  addressState?: string;
  addressCity?: string;
  addressPincode?: string;
  author?: string;
}

export interface UpdateCustomerStatusInput {
  id: string;
  status: string;
  approvedBy?: string;
}

// ── Queries / Mutations ────────────────────────────────────────────────────

const FETCH_CUSTOMERS = `
  query {
    customers {
      id companyName contactPersonName email phone
      addressState addressCity addressPincode
      userId status approvedBy approvedAt author createdAt
    }
  }
`;

const CREATE_CUSTOMER = `
  mutation CreateCustomer($input: CreateCustomerInput!) {
    createCustomer(input: $input) {
      id companyName contactPersonName email phone addressState status createdAt
    }
  }
`;

const UPDATE_CUSTOMER_STATUS = `
  mutation UpdateCustomerStatus($input: UpdateCustomerStatusInput!) {
    updateCustomerStatus(input: $input) {
      id companyName contactPersonName email phone
      addressState status approvedBy approvedAt createdAt
    }
  }
`;

// ── Functions ──────────────────────────────────────────────────────────────

export async function createCustomer(input: CreateCustomerInput): Promise<Customer> {
  const data = await gqlRequest<{ createCustomer: Customer }>(CREATE_CUSTOMER, { input });
  return data.createCustomer;
}

export async function fetchCustomers(): Promise<Customer[]> {
  const data = await gqlRequest<{ customers: Customer[] }>(FETCH_CUSTOMERS);
  return data.customers;
}

export async function updateCustomerStatus(input: UpdateCustomerStatusInput): Promise<Customer> {
  const data = await gqlRequest<{ updateCustomerStatus: Customer }>(
    UPDATE_CUSTOMER_STATUS,
    { input },
  );
  return data.updateCustomerStatus;
}
