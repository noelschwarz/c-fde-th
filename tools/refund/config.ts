import { ToolConfig } from "@/platform/config/types";
import { DEFAULT_ROLES } from "@/platform/auth/types";
import { RefundCase } from "./data";

export const refundToolConfig: ToolConfig = {
  metadata: {
    id: "refund-review",
    name: "Refund Review",
    description: "Review and approve or reject customer refund requests.",
    route: "/refunds",
  },
  connector: {
    name: "mock",
    resource: "refund_requests",
  },
  columns: [
    { key: "customer", label: "Customer", sortable: true },
    { key: "refundAmount", label: "Refund Amount", sortable: true },
    { key: "requestReason", label: "Request Reason", sortable: true },
    { key: "requestedDate", label: "Requested Date", sortable: true },
    { key: "status", label: "Status", sortable: true },
  ],
  fields: [
    { key: "id", label: "Refund ID", type: "text" },
    { key: "customer", label: "Customer", type: "text" },
    { key: "refundAmount", label: "Refund Amount", type: "number" },
    { key: "requestReason", label: "Request Reason", type: "text" },
    { key: "requestedDate", label: "Requested Date", type: "date" },
    { key: "status", label: "Status", type: "select", options: ["Pending", "Approved", "Rejected"] },
    { key: "notes", label: "Notes", type: "text" },
  ],
  sensitiveFields: [],
  filters: [
    { key: "status", label: "Status", field: "status", type: "select", options: ["Pending", "Approved", "Rejected"] },
    { key: "search", label: "Search", field: "customer", type: "search" },
  ],
  actions: [
    {
      key: "approve",
      label: "Approve",
      allowedRoles: ["reviewer", "senior_reviewer"],
      stateTransitions: [{ from: "Pending", to: "Approved" }],
      requiresReason: true,
      audit: true,
      guard: (record) => (record as RefundCase).status === "Pending",
    },
    {
      key: "reject",
      label: "Reject",
      allowedRoles: ["reviewer", "senior_reviewer"],
      stateTransitions: [{ from: "Pending", to: "Rejected" }],
      requiresReason: true,
      audit: true,
      guard: (record) => (record as RefundCase).status === "Pending",
    },
  ],
  roles: DEFAULT_ROLES,
  reasonRequirements: {
    approve: ["Valid refund request", "Duplicate charge confirmed", "Goodwill gesture", "Policy exception", "Other"],
    reject: ["Outside refund window", "Non-refundable purchase", "Suspected fraud", "Missing information", "Other"],
  },
  audit: { enabled: true, includeReason: true },
};

