"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { GenericToolView } from "@/components/runtime/GenericToolView";
import { createMockConnector } from "@/platform/connectors/mock";
import { kycToolConfig } from "@/tools/kyc/config";
import { refundToolConfig } from "@/tools/refund/config";
import { initialRefundData, RefundCase } from "@/tools/refund/data";

const tools = [kycToolConfig, refundToolConfig];

const refundConnector = createMockConnector<RefundCase>({
  resource: refundToolConfig.connector.resource,
  initialData: initialRefundData,
  getId: (item) => item.id,
});

function statusColor(status: string): string {
  switch (status) {
    case "Approved":
      return "bg-green-100 text-green-800";
    case "Rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function renderCell(row: RefundCase, key: string) {
  if (key === "status") {
    return (
      <span className={`rounded px-2 py-1 text-xs ${statusColor(row.status)}`}>
        {row.status}
      </span>
    );
  }
  if (key === "refundAmount") {
    return <span className="font-medium text-gray-900">{formatCurrency(row.refundAmount)}</span>;
  }
  return undefined;
}

function renderDetailValue(record: RefundCase, field: { key: string }) {
  if (field.key === "refundAmount") {
    return formatCurrency(record.refundAmount);
  }
  return undefined;
}

export default function RefundsPage() {
  const [role, setRole] = useState("reviewer");

  return (
    <AppShell
      tools={tools}
      activeToolId={refundToolConfig.metadata.id}
      currentRole={role}
      onRoleChange={setRole}
    >
      <GenericToolView<RefundCase>
        config={refundToolConfig}
        connector={refundConnector}
        currentRoleKey={role}
        recordLabel="Refund"
        renderCell={renderCell}
        renderDetailValue={renderDetailValue}
      />
    </AppShell>
  );
}
