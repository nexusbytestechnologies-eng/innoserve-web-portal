import { restRequest } from "$lib/api/rest";
import { invalidate } from "$lib/stores/query";
import type { Project } from "./queries";

// ── Input Types ─────────────────────────────────────────────────────────────

export interface CreateProjectInput {
  customerId: string;
  name: string;
  projectHeadId?: string;
  author?: string;
}

// ── Functions ──────────────────────────────────────────────────────────────

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const result = await restRequest<Project>('/api/projects', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  invalidate('projects');
  return result;
}
