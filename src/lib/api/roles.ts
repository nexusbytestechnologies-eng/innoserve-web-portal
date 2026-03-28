// ARCHITECTURE NOTE
// -----------------
// Rule: GraphQL → queries only; REST → actions only.
// createRole / createUserRole are write operations (violations of the rule).
// They remain as GraphQL mutations because the backend has no REST endpoints
// for role management yet. Migrate once the backend exposes REST routes.

import { gqlRequest } from "./graphql";

// ── Types ──────────────────────────────────────────────────────────────────

export interface CreateRoleInput {
  name: string;
  author?: string;
}

export interface Role {
  id: string;
  name: string;
  author: string;
  createdAt: string;
}

export interface CreateUserRoleInput {
  userId: string;
  roleId: string;
  author?: string;
}

export interface UserRole {
  userId: string;
  roleId: string;
  author: string;
  createdAt: string;
}

// ── Mutations ──────────────────────────────────────────────────────────────

const CREATE_ROLE = `
  mutation CreateRole($input: CreateRoleInput!) {
    createRole(input: $input) {
      id name author createdAt
    }
  }
`;

const CREATE_USER_ROLE = `
  mutation CreateUserRole($input: CreateUserRoleInput!) {
    createUserRole(input: $input) {
      userId roleId author createdAt
    }
  }
`;

// ── Functions ──────────────────────────────────────────────────────────────

export async function createRole(input: CreateRoleInput): Promise<Role> {
  const data = await gqlRequest<{ createRole: Role }>(CREATE_ROLE, { input });
  return data.createRole;
}

export async function createUserRole(input: CreateUserRoleInput): Promise<UserRole> {
  const data = await gqlRequest<{ createUserRole: UserRole }>(CREATE_USER_ROLE, { input });
  return data.createUserRole;
}
