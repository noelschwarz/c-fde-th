"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { KycToolView } from "@/components/tools/KycToolView";
import { kycToolConfig } from "@/tools/kyc/config";

const tools = [kycToolConfig];

export default function Home() {
  const [role, setRole] = useState("reviewer");

  return (
    <AppShell
      tools={tools}
      activeToolId={kycToolConfig.metadata.id}
      currentRole={role}
      onRoleChange={setRole}
    >
      <KycToolView currentRoleKey={role} />
    </AppShell>
  );
}
