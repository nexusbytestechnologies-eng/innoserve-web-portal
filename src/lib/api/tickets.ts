import { invalidate } from '$lib/stores/query';
import { restRequest } from '$lib/api/rest';
import type { Ticket } from '$lib/modules/data/tickets/queries';
import type { TicketStatus } from '$lib/config/roles';
import { uploadFile, fileUrl } from '$lib/api/upload';

export type TicketEscalationLevel = 'L2' | 'L3';

export interface AssignTicketInput {
  engineerId?: string;
  statePlannerId?: string;
}

export interface EscalateTicketInput {
  level: TicketEscalationLevel;
  reason: string;
  engineerId?: string;
}

export interface TicketValidation {
  id: string;
  ticketId: string;
  validatedBy: string;
  role: string;
  notes?: string | null;
  validatedAt?: string;
}

export interface UploadTicketAttachmentInput {
  ticketId: string;
  file: File;
  type: 'ir_report' | 'site_image';
  author?: string;
}

export async function updateTicketStatus(
  ticketId: string,
  status: TicketStatus,
  remarks?: string,
): Promise<Ticket> {
  const result = await restRequest<Ticket>(`/api/tickets/${ticketId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({
      status,
      ...(remarks ? { remarks } : {}),
    }),
  });
  invalidate('tickets');
  return result;
}

export async function assignTicket(
  ticketId: string,
  data: AssignTicketInput,
): Promise<Ticket> {
  const result = await restRequest<Ticket>(`/api/tickets/${ticketId}/assign`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  invalidate('tickets');
  return result;
}

export async function escalateTicket(
  ticketId: string,
  data: EscalateTicketInput,
): Promise<Ticket> {
  const result = await restRequest<Ticket>(`/api/tickets/${ticketId}/escalate`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  invalidate('tickets');
  return result;
}

export async function validateTicket(
  ticketId: string,
  notes?: string,
): Promise<TicketValidation> {
  const result = await restRequest<TicketValidation>(`/api/tickets/${ticketId}/validate`, {
    method: 'POST',
    body: JSON.stringify(notes?.trim() ? { notes: notes.trim() } : {}),
  });
  invalidate('tickets');
  return result;
}

export async function uploadTicketAttachment(
  input: UploadTicketAttachmentInput,
): Promise<{ fileUrl: string }> {
  const formData = new FormData();
  formData.append('file', input.file);
  formData.append('type', input.type);
  if (input.author) formData.append('author', input.author);

  const directResponse = await fetch(`/api/tickets/${input.ticketId}/attachments`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (directResponse.ok) {
    invalidate('tickets');
    try {
      const body = await directResponse.json() as { fileUrl?: string };
      return { fileUrl: body.fileUrl ?? '' };
    } catch {
      return { fileUrl: '' };
    }
  }

  if (![404, 405].includes(directResponse.status)) {
    const message = await directResponse.text();
    throw new Error(message || 'Failed to upload ticket attachment');
  }

  const uploadedFileId = await uploadFile(input.file);
  const uploadedFileUrl = fileUrl(uploadedFileId);

  await restRequest(`/api/attachments`, {
    method: 'POST',
    body: JSON.stringify({
      ticketId: input.ticketId,
      type: input.type,
      fileUrl: uploadedFileUrl,
      author: input.author,
    }),
  });

  invalidate('tickets');
  return { fileUrl: uploadedFileUrl };
}
