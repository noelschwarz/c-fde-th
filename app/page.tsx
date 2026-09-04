"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { GenericToolView } from "@/components/runtime/GenericToolView";
import { createMockConnector } from "@/platform/connectors/mock";
import { kycToolConfig } from "@/tools/kyc/config";
import { refundToolConfig } from "@/tools/refund/config";
import { initialKycData, KYCCase } from "@/tools/kyc/data";

const tools = [kycToolConfig, refundToolConfig];

const kycConnector = createMockConnector<KYCCase>({
  resource: kycToolConfig.connector.resource,
  initialData: initialKycData,
  getId: (item) => item.id,
});

function statusColor(status: string): string {
  switch (status) {
    case "Approved":
      return "bg-green-100 text-green-800";
    case "Rejected":
      return "bg-red-100 text-red-800";
    case "Escalated":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function riskColor(risk: string): string {
  switch (risk) {
    case "High":
      return "text-red-600 font-semibold";
    case "Medium":
      return "text-yellow-600";
    default:
      return "text-green-600";
  }
}

function renderCell(row: KYCCase, key: string) {
  if (key === "status") {
    return (
      <span className={`rounded px-2 py-1 text-xs ${statusColor(row.status)}`}>
        {row.status}
      </span>
    );
  }
  if (key === "risk") {
    return <span className={riskColor(row.risk)}>{row.risk}</span>;
  }
  return undefined;
}

export default function Home() {
  const [role, setRole] = useState("reviewer");

  return (
    <AppShell
      tools={tools}
      activeToolId={kycToolConfig.metadata.id}
      currentRole={role}
      onRoleChange={setRole}
    >
      <GenericToolView<KYCCase>
        config={kycToolConfig}
        connector={kycConnector}
        currentRoleKey={role}
        recordLabel="Case"
        renderCell={renderCell}
      />
    </AppShell>
  );
}
