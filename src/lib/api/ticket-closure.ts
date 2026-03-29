import { gqlRequest } from '$lib/api/graphql';
import { ApiError, restRequest } from '$lib/api/rest';

export interface ClosureChecks {
  ir_uploaded: boolean;
  site_image_uploaded: boolean;
  noc_validated: boolean;
  project_head_validated: boolean;
  rca_complete: boolean;
}

export interface ClosureEligibility {
  eligible: boolean;
  checks: ClosureChecks;
}

interface AttachmentRow {
  type: string | null;
}

interface TicketHistoryRow {
  remarks: string | null;
}

const FETCH_CLOSURE_CONTEXT = `
  query TicketClosureContext($ticketId: String!) {
    attachmentsByTicket(ticketId: $ticketId) {
      type
    }
    ticketHistoryByTicket(ticketId: $ticketId) {
      remarks
    }
  }
`;

function checksFromReasons(reasons: string[] = []): ClosureChecks {
  const joined = reasons.join(' | ').toLowerCase();
  return {
    ir_uploaded: !joined.includes('ir report'),
    site_image_uploaded: !joined.includes('site image'),
    noc_validated: !joined.includes('noc validation'),
    project_head_validated: !joined.includes('project head validation'),
    rca_complete: !joined.includes('rca'),
  };
}

function normalizeResponse(payload: unknown): ClosureEligibility | null {
  if (!payload || typeof payload !== 'object') return null;

  const body = payload as {
    eligible?: unknown;
    checks?: Partial<Record<keyof ClosureChecks, unknown>>;
    reasons?: unknown;
  };

  if (typeof body.eligible !== 'boolean') return null;

  if (body.checks && typeof body.checks === 'object') {
    return {
      eligible: body.eligible,
      checks: {
        ir_uploaded: Boolean(body.checks.ir_uploaded),
        site_image_uploaded: Boolean(body.checks.site_image_uploaded),
        noc_validated: Boolean(body.checks.noc_validated),
        project_head_validated: Boolean(body.checks.project_head_validated),
        rca_complete: Boolean((body.checks as Partial<Record<keyof ClosureChecks, unknown>>).rca_complete),
      },
    };
  }

  if (Array.isArray(body.reasons)) {
    return {
      eligible: body.eligible,
      checks: checksFromReasons(body.reasons.filter((value): value is string => typeof value === 'string')),
    };
  }

  return null;
}

async function fetchClosureEligibilityFallback(ticketId: string): Promise<ClosureEligibility> {
  const data = await gqlRequest<{
    attachmentsByTicket: AttachmentRow[];
    ticketHistoryByTicket: TicketHistoryRow[];
  }>(FETCH_CLOSURE_CONTEXT, { ticketId });

  const attachments = data.attachmentsByTicket ?? [];
  const history = data.ticketHistoryByTicket ?? [];
  const historyText = history
    .map((entry) => entry.remarks?.toLowerCase() ?? '')
    .join(' | ');

  const checks: ClosureChecks = {
    ir_uploaded: attachments.some((attachment) => attachment.type === 'ir_report'),
    site_image_uploaded: attachments.some((attachment) => attachment.type === 'site_image'),
    noc_validated: historyText.includes('validated by noc'),
    project_head_validated:
      historyText.includes('validated by project_head') ||
      historyText.includes('validated by project head'),
    rca_complete: historyText.includes('rca documented') || historyText.includes('rca submitted'),
  };

  return {
    eligible: Object.values(checks).every(Boolean),
    checks,
  };
}

export async function fetchClosureEligibility(ticketId: string): Promise<ClosureEligibility> {
  try {
    const response = await restRequest<unknown>(`/api/tickets/${ticketId}/closure-eligibility`);
    const normalized = normalizeResponse(response);
    if (normalized) return normalized;
  } catch (err) {
    if (!(err instanceof ApiError) || ![404, 405, 500].includes(err.status)) {
      throw err;
    }
  }

  return fetchClosureEligibilityFallback(ticketId);
}
