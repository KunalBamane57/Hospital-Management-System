// ============================================
// Role-Based Permissions System
// 3 Roles: Patient, Doctor, Admin
// ============================================

export type UserRole = "patient" | "doctor" | "admin";

export type Permission =
  | "appointments:view_own"
  | "appointments:view_all"
  | "appointments:create"
  | "appointments:update_own"
  | "appointments:update_all"
  | "appointments:cancel_own"
  | "appointments:cancel_all"
  | "patients:view_own"
  | "patients:view_all"
  | "patients:update_own"
  | "patients:update_all"
  | "patients:delete"
  | "doctors:view"
  | "doctors:update_own"
  | "doctors:update_all"
  | "doctors:delete"
  | "prescriptions:view_own"
  | "prescriptions:view_all"
  | "prescriptions:create"
  | "prescriptions:update"
  | "payments:view_own"
  | "payments:view_all"
  | "payments:process"
  | "payments:refund"
  | "reviews:view"
  | "reviews:create"
  | "reviews:delete_own"
  | "reviews:delete_all"
  | "notifications:view_own"
  | "notifications:send_all"
  | "analytics:view"
  | "users:view_all"
  | "users:create"
  | "users:update_role"
  | "users:delete";

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  patient: [
    "appointments:view_own",
    "appointments:create",
    "appointments:update_own",
    "appointments:cancel_own",
    "patients:view_own",
    "patients:update_own",
    "doctors:view",
    "prescriptions:view_own",
    "payments:view_own",
    "reviews:view",
    "reviews:create",
    "reviews:delete_own",
    "notifications:view_own",
  ],
  doctor: [
    "appointments:view_own",
    "appointments:update_own",
    "appointments:cancel_own",
    "patients:view_all",
    "doctors:view",
    "doctors:update_own",
    "prescriptions:view_own",
    "prescriptions:create",
    "prescriptions:update",
    "payments:view_own",
    "reviews:view",
    "notifications:view_own",
  ],
  admin: [
    "appointments:view_all",
    "appointments:create",
    "appointments:update_all",
    "appointments:cancel_all",
    "patients:view_all",
    "patients:update_all",
    "patients:delete",
    "doctors:view",
    "doctors:update_all",
    "doctors:delete",
    "prescriptions:view_all",
    "prescriptions:create",
    "prescriptions:update",
    "payments:view_all",
    "payments:process",
    "payments:refund",
    "reviews:view",
    "reviews:delete_all",
    "notifications:view_own",
    "notifications:send_all",
    "analytics:view",
    "users:view_all",
    "users:create",
    "users:update_role",
    "users:delete",
  ],
};

export const ROLE_META: Record<UserRole, { label: string; description: string; color: string }> = {
  patient: {
    label: "Patient",
    description: "Book appointments, view prescriptions, and manage health records",
    color: "bg-blue-500",
  },
  doctor: {
    label: "Doctor",
    description: "Manage appointments, write prescriptions, and view patient records",
    color: "bg-emerald-500",
  },
  admin: {
    label: "Admin",
    description: "Full system access — analytics, user management, and system settings",
    color: "bg-purple-500",
  },
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case "patient":
      return "/patient/dashboard";
    case "doctor":
      return "/doctor/dashboard";
    case "admin":
      return "/admin/dashboard";
    default:
      return "/";
  }
}

export const ALL_ROLES: UserRole[] = ["patient", "doctor", "admin"];
