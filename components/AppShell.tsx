"use client";

import { ToolConfig } from "@/platform/config/types";
import { RoleSwitcher } from "./RoleSwitcher";

interface AppShellProps {
  tools: ToolConfig[];
  activeToolId: string;
  currentRole: string;
  onRoleChange: (roleKey: string) => void;
  children: React.ReactNode;
}

export function AppShell({
  tools,
  activeToolId,
  currentRole,
  onRoleChange,
  children,
}: AppShellProps) {
  return (
    <div className="flex h-full min-h-screen">
      <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-gray-900 text-white">
        <div className="p-4">
          <h2 className="text-lg font-semibold">Internal Tools</h2>
        </div>
        <nav className="space-y-1 px-2">
          {tools.map((tool) => (
            <a
              key={tool.metadata.id}
              href={tool.metadata.route || `#${tool.metadata.id}`}
              className={`block rounded px-3 py-2 text-sm ${
                tool.metadata.id === activeToolId
                  ? "bg-blue-600 font-medium"
                  : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              {tool.metadata.name}
            </a>
          ))}
          <button
            disabled
            className="block w-full rounded px-3 py-2 text-left text-sm text-gray-500 cursor-not-allowed"
          >
            Refunds
          </button>
          <button className="block w-full rounded px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-800">
            + New Tool
          </button>
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
          <h1 className="font-semibold text-gray-800">Runtime</h1>
          <RoleSwitcher
            roles={tools.find((t) => t.metadata.id === activeToolId)?.roles || []}
            currentRole={currentRole}
            onChange={onRoleChange}
          />
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
