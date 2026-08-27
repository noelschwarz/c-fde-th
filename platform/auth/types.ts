import { Role } from "@/platform/config/types";

export const DEFAULT_ROLES: Role[] = [
  {
    key: "reviewer",
    label: "Reviewer",
    permissions: ["case:view", "case:reject", "case:escalate"],
    canViewSensitive: false,
  },
  {
    key: "senior_reviewer",
    label: "Senior Reviewer",
    permissions: [
      "case:view",
      "case:reject",
      "case:escalate",
      "case:approve",
      "sensitive:view",
    ],
    canViewSensitive: true,
  },
];

export function getRole(key: string): Role | undefined {
  return DEFAULT_ROLES.find((r) => r.key === key);
}

export function hasPermission(role: Role, permission: string): boolean {
  return role.permissions.includes(permission);
}

export function canViewSensitive(role: Role): boolean {
  return !!role.canViewSensitive;
}

export function mask(value: unknown): string {
  if (typeof value === "string") {
    if (value.length <= 4) return "•".repeat(value.length);
    return value.slice(0, 2) + "•".repeat(value.length - 4) + value.slice(-2);
  }
  return "•••";
}
