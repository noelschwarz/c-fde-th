import { ToolConfig } from "@/platform/config/types";
import { DEFAULT_ROLES } from "@/platform/auth/types";
import { KYCCase } from "./data";

export const kycToolConfig: ToolConfig = {
  metadata: {
    id: "kyc-review",
    name: "KYC Review",
    description: "Review and decide on customer KYC cases.",
    route: "/",
  },
  connector: {
    name: "mock",
    resource: "kyc_cases",
  },
  columns: [
    { key: "id", label: "Case ID", sortable: true },
    { key: "customerName", label: "Customer", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "status", label: "Status", sortable: true },
    { key: "risk", label: "Risk", sortable: true },
    { key: "submittedAt", label: "Submitted", sortable: true },
  ],
  fields: [
    { key: "id", label: "Case ID", type: "text" },
    { key: "customerName", label: "Customer Name", type: "text" },
    { key: "email", label: "Email", type: "text" },
    { key: "status", label: "Status", type: "select", options: ["Pending", "Escalated", "Approved", "Rejected"] },
    { key: "risk", label: "Risk", type: "select", options: ["Low", "Medium", "High"] },
    { key: "submittedAt", label: "Submitted", type: "date" },
    { key: "address", label: "Address", type: "text" },
    { key: "dateOfBirth", label: "Date of Birth", type: "date" },
    { key: "ssn", label: "SSN", type: "text" },
    { key: "riskIndicators", label: "Risk Indicators", type: "tags" },
    { key: "notes", label: "Notes", type: "text" },
  ],
  sensitiveFields: ["ssn", "dateOfBirth", "address"],
  filters: [
    { key: "risk", label: "Risk", field: "risk", type: "select", options: ["Low", "Medium", "High"] },
    { key: "status", label: "Status", field: "status", type: "select", options: ["Pending", "Escalated", "Approved", "Rejected"] },
    { key: "search", label: "Search", field: "customerName", type: "search" },
  ],
  actions: [
    {
      key: "approve",
      label: "Approve",
      requiredPermission: "case:approve",
      allowedRoles: ["senior_reviewer"],
      stateTransitions: [
        { from: "Pending", to: "Approved" },
        { from: "Escalated", to: "Approved" },
      ],
      requiresReason: false,
      audit: true,
    },
    {
      key: "reject",
      label: "Reject",
      requiredPermission: "case:reject",
      allowedRoles: ["reviewer", "senior_reviewer"],
      stateTransitions: [
        { from: "Pending", to: "Rejected" },
        { from: "Escalated", to: "Rejected" },
      ],
      requiresReason: true,
      audit: true,
    },
    {
      key: "escalate",
      label: "Escalate",
      requiredPermission: "case:escalate",
      allowedRoles: ["reviewer", "senior_reviewer"],
      stateTransitions: [{ from: "Pending", to: "Escalated" }],
      requiresReason: true,
      audit: true,
    },
  ],
  roles: DEFAULT_ROLES,
  reasonRequirements: {
    reject: ["Fraud", "Missing documents", "Sanctions match", "Other"],
    escalate: ["Need senior review", "Document verification", "Other"],
  },
  audit: { enabled: true, includeReason: true },
};

// Type-safe guard: reviewers cannot approve high-risk cases.
export function canApproveCase(roleKey: string, record: KYCCase): boolean {
  if (roleKey !== "senior_reviewer") return false;
  return true;
}
