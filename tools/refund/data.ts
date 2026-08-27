export interface RefundCase extends Record<string, unknown> {
  id: string;
  customer: string;
  refundAmount: number;
  requestReason: string;
  requestedDate: string;
  status: "Pending" | "Approved" | "Rejected";
  notes: string;
}

export const initialRefundData: RefundCase[] = [
  {
    id: "rfd-001",
    customer: "Olivia Harper",
    refundAmount: 49.99,
    requestReason: "Duplicate charge",
    requestedDate: "2026-08-25",
    status: "Pending",
    notes: "Customer reported being charged twice for the same order.",
  },
  {
    id: "rfd-002",
    customer: "Marcus Chen",
    refundAmount: 129.0,
    requestReason: "Service outage",
    requestedDate: "2026-08-24",
    status: "Pending",
    notes: "Service unavailable during the customer’s billing window.",
  },
  {
    id: "rfd-003",
    customer: "Sophia Miller",
    refundAmount: 12.5,
    requestReason: "Changed mind",
    requestedDate: "2026-08-23",
    status: "Approved",
    notes: "Within 14-day return window; approved by reviewer.",
  },
  {
    id: "rfd-004",
    customer: "Liam Johnson",
    refundAmount: 299.99,
    requestReason: "Fraudulent charge",
    requestedDate: "2026-08-22",
    status: "Rejected",
    notes: "Investigation found the charge was authorized by the account holder.",
  },
  {
    id: "rfd-005",
    customer: "Ava Davis",
    refundAmount: 58.25,
    requestReason: "Billing error",
    requestedDate: "2026-08-26",
    status: "Pending",
    notes: "Incorrect tax applied to subscription renewal.",
  },
];
