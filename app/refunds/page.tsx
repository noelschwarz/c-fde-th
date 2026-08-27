"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { RefundToolView } from "@/components/tools/RefundToolView";
import { kycToolConfig } from "@/tools/kyc/config";
import { refundToolConfig } from "@/tools/refund/config";

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
      <RefundToolView currentRoleKey={role} />
    </AppShell>
  );
}
