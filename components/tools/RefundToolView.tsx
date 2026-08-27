"use client";

import { useEffect, useMemo, useState } from "react";
import { refundToolConfig } from "@/tools/refund/config";
import { initialRefundData, RefundCase } from "@/tools/refund/data";
import { createMockConnector } from "@/platform/connectors/mock";
import { DataConnector, ListQuery } from "@/platform/connectors/connector";
import { Action, Role, ToolConfig, Column } from "@/platform/config/types";
import { getRole, hasPermission, canViewSensitive, mask } from "@/platform/auth/types";
import { emit, list as listAudit } from "@/platform/audit/audit";
import { AuditEvent } from "@/platform/audit/types";
import { DataTable } from "@/components/runtime/DataTable";
import { FilterBar } from "@/components/runtime/FilterBar";
import { ActionModal } from "@/components/runtime/ActionModal";
import { AuditHistory } from "@/components/AuditHistory";

const connector: DataConnector<RefundCase> = createMockConnector<RefundCase>({
  resource: refundToolConfig.connector.resource,
  initialData: initialRefundData,
  getId: (item) => item.id,
});

function formatValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(", ");
  if (value === undefined || value === null) return "—";
  return String(value);
}

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
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function RefundToolView({ currentRoleKey }: { currentRoleKey: string }) {
  const [cases, setCases] = useState<RefundCase[]>([]);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [selectedCase, setSelectedCase] = useState<RefundCase | null>(null);
  const [activeAction, setActiveAction] = useState<Action | null>(null);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);

  const role = getRole(currentRoleKey);

  const load = () => {
    const query: ListQuery = {
      search: filterValues.search,
      filters: {
        status: filterValues.status,
      },
    };
    const result = connector.list(query);
    const data = "then" in result ? [] : result.data;
    if ("then" in result) {
      result.then((r) => setCases(r.data));
    } else {
      setCases(data);
    }
    setAuditEvents(listAudit(refundToolConfig.metadata.id));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValues]);

  const config: ToolConfig = refundToolConfig;

  const tableRows = useMemo(() => {
    return cases.map((item) => {
      const row: Record<string, unknown> = { ...item };
      if (role && !canViewSensitive(role)) {
        config.sensitiveFields.forEach((field) => {
          row[field] = mask(item[field as keyof RefundCase]);
        });
      }
      return row as RefundCase;
    });
  }, [cases, role, config.sensitiveFields]);

  const actionsForCase = (record: RefundCase): Action[] => {
    if (!role) return [];
    return config.actions.filter((action) => {
      if (action.requiredPermission && !hasPermission(role, action.requiredPermission)) return false;
      if (action.allowedRoles && !action.allowedRoles.includes(role.key)) return false;
      if (action.guard && !action.guard(record, role)) return false;
      if (action.stateTransitions) {
        return action.stateTransitions.some(
          (t) => t.from === record.status || t.from === "*"
        );
      }
      return true;
    });
  };

  const renderCell = (row: RefundCase, key: string) => {
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
    return formatValue(row[key as keyof RefundCase]);
  };

  const runAction = async (action: Action, reason?: string) => {
    if (!selectedCase || !role) return;
    const transition = action.stateTransitions?.find(
      (t) => t.from === selectedCase.status || t.from === "*"
    );
    if (!transition) return;

    const previousState = { status: selectedCase.status };
    const newState = { status: transition.to };

    await connector.update(selectedCase.id, { status: transition.to } as Partial<RefundCase>);

    if (action.audit) {
      emit({
        action: action.key,
        recordId: selectedCase.id,
        actingRole: role.key,
        previousState,
        newState,
        reason,
        toolId: config.metadata.id,
      });
    }

    setActiveAction(null);
    setSelectedCase(null);
    load();
  };

  const displayCase = selectedCase
    ? (() => {
        const copy = { ...selectedCase };
        if (role && !canViewSensitive(role)) {
          config.sensitiveFields.forEach((field) => {
            copy[field as keyof RefundCase] = mask(copy[field as keyof RefundCase]) as any;
          });
        }
        return copy;
      })()
    : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{config.metadata.name}</h2>
        <span className="text-sm text-gray-500">{cases.length} cases</span>
      </div>

      <FilterBar
        filters={config.filters}
        values={filterValues}
        onChange={(key, value) =>
          setFilterValues((prev) => ({ ...prev, [key]: value }))
        }
      />

      <DataTable<RefundCase>
        columns={config.columns}
        rows={tableRows}
        rowKey={(row) => row.id}
        renderCell={renderCell}
        onRowClick={(row) => setSelectedCase(cases.find((c) => c.id === row.id) || null)}
      />

      {selectedCase && displayCase && (
        <div className="rounded border border-gray-200 bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Refund {displayCase.id}</h3>
            <button
              onClick={() => setSelectedCase(null)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {config.fields.map((field) => {
              if (field.hidden) return null;
              const raw = displayCase[field.key as keyof RefundCase];
              let value: React.ReactNode;
              if (field.key === "refundAmount") {
                value = formatCurrency(raw as number);
              } else if (field.type === "tags") {
                value = (raw as string[]).join(", ");
              } else {
                value = formatValue(raw);
              }
              const isSensitive = config.sensitiveFields.includes(field.key);
              return (
                <div key={field.key}>
                  <label className="block text-xs font-medium text-gray-500">
                    {field.label}
                    {isSensitive && (
                      <span className="ml-1 rounded bg-gray-200 px-1 text-[10px] text-gray-700">
                        PII
                      </span>
                    )}
                  </label>
                  <div className="text-sm">{value}</div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {actionsForCase(selectedCase).map((action) => (
              <button
                key={action.key}
                onClick={() => setActiveAction(action)}
                className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
              >
                {action.label}
              </button>
            ))}
            {actionsForCase(selectedCase).length === 0 && (
              <span className="text-sm text-gray-500">No actions available for this case/role.</span>
            )}
          </div>
        </div>
      )}

      {activeAction && (
        <ActionModal
          action={activeAction}
          reasonOptions={
            config.reasonRequirements?.[activeAction.key]
          }
          onConfirm={(reason) => runAction(activeAction, reason)}
          onCancel={() => setActiveAction(null)}
        />
      )}

      <AuditHistory events={auditEvents} />
    </div>
  );
}
