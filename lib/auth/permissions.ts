import { getSession } from "@/lib/auth/session";

// Define all available permissions
export type Permission =
  | "view_dashboard"
  | "manage_users"
  | "view_defendants"
  | "manage_defendants"
  | "view_bonds"
  | "manage_bonds"
  | "view_payments"
  | "manage_payments"
  | "view_sms"
  | "manage_sms"
  | "view_signatures"
  | "manage_signatures"
  | "view_reports"
  | "manage_settings";

export type Role =
  | "administrator"
  | "manager"
  | "agent"
  | "receptionist"
  | "collector"
  | "read_only";

// Define which roles have which permissions
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  administrator: [
    "view_dashboard",
    "manage_users",
    "view_defendants",
    "manage_defendants",
    "view_bonds",
    "manage_bonds",
    "view_payments",
    "manage_payments",
    "view_sms",
    "manage_sms",
    "view_signatures",
    "manage_signatures",
    "view_reports",
    "manage_settings",
  ],
  manager: [
    "view_dashboard",
    "view_defendants",
    "manage_defendants",
    "view_bonds",
    "manage_bonds",
    "view_payments",
    "manage_payments",
    "view_sms",
    "manage_sms",
    "view_signatures",
    "manage_signatures",
    "view_reports",
  ],
  agent: [
    "view_dashboard",
    "view_defendants",
    "manage_defendants",
    "view_bonds",
    "manage_bonds",
    "view_payments",
    "view_sms",
    "manage_sms",
    "view_signatures",
    "manage_signatures",
  ],
  receptionist: [
    "view_dashboard",
    "view_defendants",
    "view_bonds",
    "view_payments",
    "manage_payments",
    "view_sms",
  ],
  collector: [
    "view_dashboard",
    "view_defendants",
    "view_bonds",
    "view_payments",
    "manage_payments",
    "view_sms",
    "manage_sms",
  ],
  read_only: [
    "view_dashboard",
    "view_defendants",
    "view_bonds",
    "view_payments",
    "view_sms",
    "view_signatures",
    "view_reports",
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: string, permission: Permission): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role as Role];
  if (!permissions) return false;
  return permissions.includes(permission);
}

/**
 * Throws an error if the current session does not have the required permission.
 * Useful for server actions.
 */
export async function requirePermission(permission: Permission) {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  if (!hasPermission(session.role, permission)) {
    throw new Error("Forbidden: Insufficient permissions");
  }

  return session;
}
