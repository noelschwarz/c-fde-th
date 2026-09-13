"use client";

import { useEffect, useMemo, useState } from "react";
import { ToolConfig, Field, Action, Role } from "@/platform/config/types";
import { DataConnector, ListQuery } from "@/platform/connectors/connector";
import { getRole, hasPermission, canViewSensitive, mask } from "@/platform/auth/types";
import { emit, list as listAudit } from "@/platform/audit/audit";
import { AuditEvent } from "@/platform/audit/types";
import { DataTable } from "@/components/runtime/DataTable";
import { FilterBar } from "@/components/runtime/FilterBar";
import { ActionModal } from "@/components/runtime/ActionModal";
import { AuditHistory } from "@/components/AuditHistory";

export interface GenericToolViewProps<T extends Record<string, unknown>> {
  config: ToolConfig;
  connector: DataConnector<T>;
  currentRoleKey: string;
  recordLabel?: string;
  renderCell?: (row: T, key: string) => React.ReactNode | undefined;
  renderDetailValue?: (row: T, field: Field) => React.ReactNode | undefined;
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(", ");
  if (value === undefined || value === null) return "—";
  return String(value);
}

function defaultDetailValue(row: Record<string, unknown>, field: Field): string {
  const raw = row[field.key];
  if (field.type === "tags" && Array.isArray(raw)) return raw.join(", ");
  return formatValue(raw);
}

function applyMasking<T extends Record<string, unknown>>(
  record: T,
  sensitiveFields: string[],
  role?: Role
): T {
  const masked: Record<string, unknown> = { ...record };
  if (role && !canViewSensitive(role)) {
    for (const field of sensitiveFields) {
      masked[field] = mask(record[field]);
    }
  }
  return masked as T;
}

function buildListQuery(filters: ToolConfig["filters"], values: Record<string, string>): ListQuery {
  const query: ListQuery = {};
  const filterMap: Record<string, string | string[]> = {};

  for (const filter of filters) {
    const value = values[filter.key];
    if (value === undefined || value === "") continue;

    if (filter.type === "search") {
      query.search = value;
    } else {
      filterMap[filter.field] = value;
    }
  }

  if (Object.keys(filterMap).length > 0) {
    query.filters = filterMap;
  }

  return query;
}

function isActionAvailable<T extends Record<string, unknown>>(
  action: Action,
  record: T,
  role?: Role
): boolean {
  if (!role) return false;
  if (action.requiredPermission && !hasPermission(role, action.requiredPermission)) return false;
  if (action.allowedRoles && !action.allowedRoles.includes(role.key)) return false;
  if (action.guard && !action.guard(record as Record<string, unknown>, role)) return false;
  if (action.stateTransitions) {
    return action.stateTransitions.some((t) => t.from === record.status || t.from === "*");
  }
  return true;
}

export function GenericToolView<T extends Record<string, unknown>>({
  config,
  connector,
  currentRoleKey,
  recordLabel = "Record",
  renderCell,
  renderDetailValue,
}: GenericToolViewProps<T>) {
  const [records, setRecords] = useState<T[]>([]);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [selectedRecord, setSelectedRecord] = useState<T | null>(null);
  const [activeAction, setActiveAction] = useState<Action | null>(null);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);

  const role = getRole(currentRoleKey);

  const load = async () => {
    const query = buildListQuery(config.filters, filterValues);
    const result = await connector.list(query);
    setRecords(result.data);
    setAuditEvents(listAudit(config.metadata.id));
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValues, currentRoleKey]);

  const tableRows = useMemo(
    () => records.map((record) => applyMasking(record, config.sensitiveFields, role)),
    [records, role, config.sensitiveFields]
  );

  const displayRecord =
    selectedRecord ? applyMasking(selectedRecord, config.sensitiveFields, role) : null;

  const renderCellInternal = (row: T, key: string) => {
    const custom = renderCell?.(row, key);
    if (custom !== undefined) return custom;
    return formatValue(row[key]);
  };

  const availableActions = selectedRecord
    ? config.actions.filter((action) => isActionAvailable(action, selectedRecord, role))
    : [];

  const runAction = async (action: Action, reason?: string) => {
    if (!selectedRecord || !role) return;

    const transition = action.stateTransitions?.find(
      (t) => t.from === selectedRecord.status || t.from === "*"
    );
    if (!transition) return;

    const previousState = { status: selectedRecord.status };
    await connector.update(String(selectedRecord.id), { status: transition.to } as unknown as Partial<T>);
    const newState = { status: transition.to };

    if (action.audit) {
      emit({
        action: action.key,
        recordId: String(selectedRecord.id),
        actingRole: role.key,
        previousState,
        newState,
        reason,
        toolId: config.metadata.id,
      });
    }

    setActiveAction(null);
    setSelectedRecord(null);
    await load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{config.metadata.name}</h2>
        <span className="text-sm text-gray-500">{records.length} records</span>
      </div>

      <FilterBar
        filters={config.filters}
        values={filterValues}
        onChange={(key, value) => setFilterValues((prev) => ({ ...prev, [key]: value }))}
      />

      <DataTable<T>
        columns={config.columns}
        rows={tableRows}
        rowKey={(row) => String(row.id)}
        renderCell={renderCellInternal}
        onRowClick={(row) => {
          const original = records.find((r) => String(r.id) === String(row.id));
          setSelectedRecord(original || null);
        }}
      />

      {selectedRecord && displayRecord && (
        <div className="rounded border border-gray-200 bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {recordLabel} {String(displayRecord.id)}
            </h3>
            <button
              onClick={() => setSelectedRecord(null)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {config.fields.map((field) => {
              if (field.hidden) return null;
              const isSensitive = config.sensitiveFields.includes(field.key);
              const custom = renderDetailValue?.(displayRecord, field);
              const value = custom === undefined ? defaultDetailValue(displayRecord, field) : custom;

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
            {availableActions.map((action) => (
              <button
                key={action.key}
                onClick={() => setActiveAction(action)}
                className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
              >
                {action.label}
              </button>
            ))}
            {availableActions.length === 0 && (
              <span className="text-sm text-gray-500">No actions available for this record/role.</span>
            )}
          </div>
        </div>
      )}

      {activeAction && (
        <ActionModal
          action={activeAction}
          reasonOptions={config.reasonRequirements?.[activeAction.key]}
          onConfirm={(reason) => runAction(activeAction, reason)}
          onCancel={() => setActiveAction(null)}
        />
      )}

      {config.audit.enabled && <AuditHistory events={auditEvents} />}
    </div>
  );
}
