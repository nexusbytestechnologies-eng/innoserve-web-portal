import { restRequest } from "$lib/api/rest";
import { invalidate } from "$lib/stores/query";
import type { Ticket, TicketHistory, Attachment, TicketCategory } from "./queries";
import {
  assignTicket as assignTicketRequest,
  escalateTicket as escalateTicketRequest,
  updateTicketStatus,
  type EscalateTicketInput as ApiEscalateTicketInput,
} from "$lib/api/tickets";
import type { TicketStatus } from "$lib/config/roles";

// ── Input Types ─────────────────────────────────────────────────────────────

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
  statePlannerId?: string;
  escalationLevel?: string;
  payoutAmount?: number;
  slaDeadline?: string;
  author?: string;
}

export interface UpdateTicketInput {
  id: string;
  status?: TicketStatus;
  assignedEngineerId?: string;
  statePlannerId?: string;
}

export interface CreateTicketHistoryInput {
  ticketId: string;
  status?: string;
  remarks?: string;
  author?: string;
}

export interface CreateAttachmentInput {
  ticketId: string;
  type?: string;
  fileUrl?: string;
  author?: string;
}

export interface CreateTicketCategoryInput {
  name: string;
  defaultPayout?: number;
  author?: string;
}

// ── Functions ──────────────────────────────────────────────────────────────

export async function createTicket(input: CreateTicketInput): Promise<Ticket> {
  const result = await restRequest<Ticket>('/api/tickets', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  invalidate('tickets');
  return result;
}

export async function updateTicket(input: UpdateTicketInput): Promise<Ticket> {
  const { id, status, assignedEngineerId, statePlannerId } = input;

  if (status) {
    return updateTicketStatus(id, status);
  }

  return assignTicketRequest(id, {
    engineerId: assignedEngineerId,
    statePlannerId,
  });
}

export async function createTicketHistory(input: CreateTicketHistoryInput): Promise<TicketHistory> {
  const { ticketId, ...body } = input;
  return restRequest<TicketHistory>(`/api/tickets/${ticketId}/history`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function createAttachment(input: CreateAttachmentInput): Promise<Attachment> {
  return restRequest<Attachment>('/api/attachments', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function createTicketCategory(
  input: CreateTicketCategoryInput,
): Promise<TicketCategory> {
  return restRequest<TicketCategory>('/api/ticket-categories', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export interface EscalateTicketInput {
  id: string;
  escalationLevel: ApiEscalateTicketInput['level'];
  reason?: string;
  engineerId?: string;
}

export async function escalateTicket(input: EscalateTicketInput): Promise<Ticket> {
  return escalateTicketRequest(input.id, {
    level: input.escalationLevel,
    reason: input.reason ?? `Support requested: ${input.escalationLevel}`,
    engineerId: input.engineerId,
  });
}
