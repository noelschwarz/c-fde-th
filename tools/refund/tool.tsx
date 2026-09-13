"use client";

import type { ReactNode } from "react";
import { createMockConnector } from "@/platform/connectors/mock";
import { Field } from "@/platform/config/types";
import { refundToolConfig } from "./config";
import { initialRefundData, RefundCase } from "./data";

export const refundConnector = createMockConnector<RefundCase>({
  resource: refundToolConfig.connector.resource,
  initialData: initialRefundData,
  getId: (item) => item.id,
});

export const refundRecordLabel = "Refund";

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

export function renderRefundCell(row: RefundCase, key: string): ReactNode | undefined {
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

export function renderRefundDetailValue(record: RefundCase, field: Field): ReactNode | undefined {
  if (field.key === "refundAmount") {
    return formatCurrency(record.refundAmount);
  }
  return undefined;
}
