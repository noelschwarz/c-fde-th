export type FieldType = "text" | "number" | "date" | "select" | "boolean" | "tags" | "json";

export interface Field {
  key: string;
  label: string;
  type?: FieldType;
  options?: string[];
  hidden?: boolean;
}

export interface Column {
  key: string;
  label: string;
  type?: FieldType;
  sortable?: boolean;
  width?: string;
}

export interface Filter {
  key: string;
  label: string;
  field: string;
  type: "select" | "multiselect" | "search" | "date";
  options?: string[];
}

export interface StateTransition {
  from: string | "*";
  to: string;
}

export interface Action {
  key: string;
  label: string;
  requiresReason?: boolean;
  allowedRoles?: string[];
  requiredPermission?: string;
  stateTransitions?: StateTransition[];
  guard?: (record: Record<string, unknown>, role: Role) => boolean;
  audit: boolean;
}

export interface Permission {
  key: string;
  label: string;
}

export interface Role {
  key: string;
  label: string;
  permissions: string[];
  canViewSensitive?: boolean;
}

export interface AuditRequirement {
  enabled: boolean;
  includeReason?: boolean;
}

export interface ConnectorConfig {
  name: string;
  resource: string;
  // Additional connector-specific configuration can be added here.
  [key: string]: unknown;
}

export interface ToolMetadata {
  id: string;
  name: string;
  description?: string;
  route?: string;
  icon?: string;
}

export interface ToolConfig {
  metadata: ToolMetadata;
  connector: ConnectorConfig;
  columns: Column[];
  fields: Field[];
  sensitiveFields: string[];
  filters: Filter[];
  actions: Action[];
  roles: Role[];
  reasonRequirements?: Record<string, string[]>;
  audit: AuditRequirement;
}
