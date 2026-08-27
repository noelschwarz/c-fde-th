"use client";

import { Role } from "@/platform/config/types";

interface RoleSwitcherProps {
  roles: Role[];
  currentRole: string;
  onChange: (roleKey: string) => void;
}

export function RoleSwitcher({ roles, currentRole, onChange }: RoleSwitcherProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <label className="text-gray-600">Role:</label>
      <select
        value={currentRole}
        onChange={(e) => onChange(e.target.value)}
        className="rounded border border-gray-300 px-2 py-1"
      >
        {roles.map((role) => (
          <option key={role.key} value={role.key}>
            {role.label}
          </option>
        ))}
      </select>
    </div>
  );
}
