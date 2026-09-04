"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { GenericToolView } from "@/components/runtime/GenericToolView";
import { kycToolConfig } from "@/tools/kyc/config";
import { kycConnector, kycRecordLabel, renderKycCell } from "@/tools/kyc/tool";
import { refundToolConfig } from "@/tools/refund/config";

const tools = [kycToolConfig, refundToolConfig];

export default function Home() {
  const [role, setRole] = useState("reviewer");

  return (
    <AppShell
      tools={tools}
      activeToolId={kycToolConfig.metadata.id}
      currentRole={role}
      onRoleChange={setRole}
    >
      <GenericToolView
        config={kycToolConfig}
        connector={kycConnector}
        currentRoleKey={role}
        recordLabel={kycRecordLabel}
        renderCell={renderKycCell}
      />
    </AppShell>
  );
}
