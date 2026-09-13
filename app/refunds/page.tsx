"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { GenericToolView } from "@/components/runtime/GenericToolView";
import { kycToolConfig } from "@/tools/kyc/config";
import { refundToolConfig } from "@/tools/refund/config";
import {
  refundConnector,
  refundRecordLabel,
  renderRefundCell,
  renderRefundDetailValue,
} from "@/tools/refund/tool";

const tools = [kycToolConfig, refundToolConfig];

export default function RefundsPage() {
  const [role, setRole] = useState("reviewer");

  return (
    <AppShell
      tools={tools}
      activeToolId={refundToolConfig.metadata.id}
      currentRole={role}
      onRoleChange={setRole}
    >
      <GenericToolView
        config={refundToolConfig}
        connector={refundConnector}
        currentRoleKey={role}
        recordLabel={refundRecordLabel}
        renderCell={renderRefundCell}
        renderDetailValue={renderRefundDetailValue}
      />
    </AppShell>
  );
}
