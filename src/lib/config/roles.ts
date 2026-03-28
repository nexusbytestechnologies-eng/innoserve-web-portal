// Central role configuration — import from here, never hardcode role strings.

// ── Types ──────────────────────────────────────────────────────────────────

export type Role =
  | 'super_admin'
  | 'customer'
  | 'engineer'
  | 'noc'
  | 'state_planner'
  | 'project_head';

export type TicketStatus =
  | 'open'
  | 'in_progress'
  | 'pending_validation'
  | 'resolved'
  | 'closed'
  | 'cancelled';

export type CustomerStatus = 'pending' | 'active' | 'rejected' | 'inactive';

export type EngineerDocStatus = 'pending' | 'approved' | 'rejected' | 'reupload';

// ── Display labels ─────────────────────────────────────────────────────────

export const ROLE_LABELS: Record<Role, string> = {
  super_admin:  'Super Admin',
  engineer:     'Engineer',
  customer:     'Customer',
  noc:          'NOC',
  state_planner:'State Planner',
  project_head: 'Project Head',
};

export const ROLE_BADGE_COLORS: Record<Role, string> = {
  super_admin:  'bg-[#0B182A] text-white',
  engineer:     'bg-blue-700 text-white',
  customer:     'bg-emerald-700 text-white',
  noc:          'bg-purple-700 text-white',
  state_planner:'bg-amber-600 text-white',
  project_head: 'bg-rose-700 text-white',
};

// ── Routing ────────────────────────────────────────────────────────────────

export const ROLE_REDIRECTS: Record<Role, string> = {
  super_admin:  '/admin',
  engineer:     '/engineer',
  customer:     '/customer',
  noc:          '/noc',
  state_planner:'/planner',
  project_head: '/project',
};

// ── Ticket status options per role ─────────────────────────────────────────
// Controls which statuses are visible in TicketForm dropdowns.

export const ROLE_STATUS_OPTIONS: Record<Role, TicketStatus[]> = {
  super_admin:  ['open', 'in_progress', 'pending_validation', 'resolved', 'closed', 'cancelled'],
  state_planner:['open', 'in_progress', 'pending_validation', 'resolved', 'closed', 'cancelled'],
  noc:          ['pending_validation', 'closed'],
  project_head: ['pending_validation', 'closed'],
  engineer:     ['in_progress', 'resolved'],
  customer:     ['open', 'cancelled'],
};

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  open:               'Open',
  in_progress:        'In Progress',
  pending_validation: 'Pending Validation',
  resolved:           'Resolved',
  closed:             'Closed',
  cancelled:          'Cancelled',
};

// ── Customer status options ────────────────────────────────────────────────

export const CUSTOMER_STATUS_OPTIONS: CustomerStatus[] = [
  'pending', 'active', 'rejected', 'inactive',
];

export const CUSTOMER_STATUS_LABELS: Record<CustomerStatus, string> = {
  pending:  'Pending',
  active:   'Active',
  rejected: 'Rejected',
  inactive: 'Inactive',
};

// ── Engineer document status options ───────────────────────────────────────

export const ENGINEER_DOC_STATUS_OPTIONS: EngineerDocStatus[] = [
  'pending', 'approved', 'rejected', 'reupload',
];

export const ENGINEER_DOC_STATUS_LABELS: Record<EngineerDocStatus, string> = {
  pending:  'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  reupload: 'Re-upload Required',
};

// ── Permissions ────────────────────────────────────────────────────────────

export interface RolePermissions {
  canApproveCustomers:  boolean;
  canApproveEngineers:  boolean;
  canCreateTickets:     boolean;
  canAssignEngineers:   boolean;
  canViewAllTickets:    boolean;
  canManageProjects:    boolean;
  canViewReports:       boolean;
}

export const ROLE_PERMISSIONS: Record<Role, RolePermissions> = {
  super_admin: {
    canApproveCustomers: true,
    canApproveEngineers: true,
    canCreateTickets:    true,
    canAssignEngineers:  true,
    canViewAllTickets:   true,
    canManageProjects:   true,
    canViewReports:      true,
  },
  noc: {
    canApproveCustomers: false,
    canApproveEngineers: false,
    canCreateTickets:    true,
    canAssignEngineers:  true,
    canViewAllTickets:   true,
    canManageProjects:   false,
    canViewReports:      true,
  },
  state_planner: {
    canApproveCustomers: false,
    canApproveEngineers: false,
    canCreateTickets:    true,
    canAssignEngineers:  true,
    canViewAllTickets:   true,
    canManageProjects:   false,
    canViewReports:      true,
  },
  project_head: {
    canApproveCustomers: false,
    canApproveEngineers: false,
    canCreateTickets:    true,
    canAssignEngineers:  false,
    canViewAllTickets:   true,
    canManageProjects:   true,
    canViewReports:      true,
  },
  engineer: {
    canApproveCustomers: false,
    canApproveEngineers: false,
    canCreateTickets:    false,
    canAssignEngineers:  false,
    canViewAllTickets:   false,
    canManageProjects:   false,
    canViewReports:      false,
  },
  customer: {
    canApproveCustomers: false,
    canApproveEngineers: false,
    canCreateTickets:    true,
    canAssignEngineers:  false,
    canViewAllTickets:   false,
    canManageProjects:   false,
    canViewReports:      false,
  },
};
