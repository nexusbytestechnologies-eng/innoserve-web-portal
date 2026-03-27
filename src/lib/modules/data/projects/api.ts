import { gqlRequest } from "$lib/api/graphql";

// ── Types ──────────────────────────────────────────────────────────────────

export interface CreateProjectInput {
  customerId: string;
  name: string;
  author?: string;
}

export interface Project {
  id: string;
  customerId: string;
  name: string;
  author: string;
  createdAt: string;
}

// ── Mutation ───────────────────────────────────────────────────────────────

const CREATE_PROJECT = `
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      id customerId name author createdAt
    }
  }
`;

// ── Function ───────────────────────────────────────────────────────────────

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const data = await gqlRequest<{ createProject: Project }>(CREATE_PROJECT, { input });
  return data.createProject;
}
