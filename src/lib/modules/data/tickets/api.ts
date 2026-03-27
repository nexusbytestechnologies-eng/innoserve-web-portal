import { gqlRequest } from "$lib/api/graphql";

// ── Types ──────────────────────────────────────────────────────────────────

export interface CreateTicketInput {
  ticketNumber?: string;
  projectId?: string;
  categoryId?: string;
  title: string;
  description?: string;
  priority?: string;
  status?: string;
  state?: string;
  city?: string;
  pincode?: string;
  address?: string;
  assignedEngineerId?: string;
  payoutAmount?: number;
  slaDeadline?: string;
  author?: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  projectId: string;
  categoryId: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  state: string;
  city: string;
  pincode: string;
  address: string;
  assignedEngineerId: string;
  payoutAmount: number;
  slaDeadline: string;
  author: string;
  createdAt: string;
}

export interface CreateTicketCategoryInput {
  name: string;
  defaultPayout?: number;
  author?: string;
}

export interface TicketCategory {
  id: string;
  name: string;
  defaultPayout: number;
  author: string;
  createdAt: string;
}

export interface CreateTicketHistoryInput {
  ticketId: string;
  status?: string;
  remarks?: string;
  author?: string;
}

export interface TicketHistory {
  id: string;
  ticketId: string;
  status: string;
  remarks: string;
  author: string;
  createdAt: string;
}

export interface CreateAttachmentInput {
  ticketId: string;
  type?: string;
  fileUrl?: string;
  author?: string;
}

export interface Attachment {
  id: string;
  ticketId: string;
  type: string;
  fileUrl: string;
  uploadedAt: string;
  author: string;
  createdAt: string;
}

// ── Mutations ──────────────────────────────────────────────────────────────

const CREATE_TICKET = `
  mutation CreateTicket($input: CreateTicketInput!) {
    createTicket(input: $input) {
      id ticketNumber projectId categoryId title description
      priority status state city pincode address
      assignedEngineerId payoutAmount slaDeadline author createdAt
    }
  }
`;

const CREATE_TICKET_CATEGORY = `
  mutation CreateTicketCategory($input: CreateTicketCategoryInput!) {
    createTicketCategory(input: $input) {
      id name defaultPayout author createdAt
    }
  }
`;

const CREATE_TICKET_HISTORY = `
  mutation CreateTicketHistory($input: CreateTicketHistoryInput!) {
    createTicketHistory(input: $input) {
      id ticketId status remarks author createdAt
    }
  }
`;

const CREATE_ATTACHMENT = `
  mutation CreateAttachment($input: CreateAttachmentInput!) {
    createAttachment(input: $input) {
      id ticketId type fileUrl uploadedAt author createdAt
    }
  }
`;

// ── Functions ──────────────────────────────────────────────────────────────

export async function createTicket(input: CreateTicketInput): Promise<Ticket> {
  const data = await gqlRequest<{ createTicket: Ticket }>(CREATE_TICKET, { input });
  return data.createTicket;
}

export async function createTicketCategory(
  input: CreateTicketCategoryInput,
): Promise<TicketCategory> {
  const data = await gqlRequest<{ createTicketCategory: TicketCategory }>(
    CREATE_TICKET_CATEGORY,
    { input },
  );
  return data.createTicketCategory;
}

export async function createTicketHistory(
  input: CreateTicketHistoryInput,
): Promise<TicketHistory> {
  const data = await gqlRequest<{ createTicketHistory: TicketHistory }>(
    CREATE_TICKET_HISTORY,
    { input },
  );
  return data.createTicketHistory;
}

export async function createAttachment(input: CreateAttachmentInput): Promise<Attachment> {
  const data = await gqlRequest<{ createAttachment: Attachment }>(CREATE_ATTACHMENT, { input });
  return data.createAttachment;
}
