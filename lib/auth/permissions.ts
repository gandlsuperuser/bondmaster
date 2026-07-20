

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
  | "view_email"
  | "manage_email"
  | "view_reminders"
  | "manage_reminders"
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
    "view_email",
    "manage_email",
    "view_reminders",
    "manage_reminders",
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
    "view_email",
    "manage_email",
    "view_reminders",
    "manage_reminders",
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
    "view_email",
    "manage_email",
    "view_reminders",
    "manage_reminders",
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
    "view_email",
    "view_reminders",
  ],
  collector: [
    "view_dashboard",
    "view_defendants",
    "view_bonds",
    "view_payments",
    "manage_payments",
    "view_sms",
    "manage_sms",
    "view_email",
    "view_reminders",
  ],
  read_only: [
    "view_dashboard",
    "view_defendants",
    "view_bonds",
    "view_payments",
    "view_sms",
    "view_email",
    "view_reminders",
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

