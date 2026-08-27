"use client";

import { AuditEvent } from "@/platform/audit/types";

export function AuditHistory({ events }: { events: AuditEvent[] }) {
  return (
    <div className="rounded border border-gray-200 bg-white p-4">
      <h3 className="mb-3 font-semibold text-gray-800">Audit History</h3>
      {events.length === 0 && <p className="text-sm text-gray-500">No audit events yet.</p>}
      <ul className="space-y-2">
        {events.map((event) => (
          <li key={event.id} className="text-sm text-gray-700">
            <span className="font-medium">{event.action}</span> on{" "}
            <span className="font-mono text-xs">{event.recordId}</span>
            {" "}by {event.actingRole} at{" "}
            {new Date(event.timestamp).toLocaleString()}
            {event.reason && <span className="text-gray-500"> — reason: {event.reason}</span>}
            <span className="block text-xs text-gray-500">
              {JSON.stringify(event.previousState)} → {JSON.stringify(event.newState)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
