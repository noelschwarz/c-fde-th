export interface AuditEvent {
  id: string;
  action: string;
  recordId: string;
  actingRole: string;
  timestamp: string;
  previousState: unknown;
  newState: unknown;
  reason?: string;
  toolId: string;
}

export type AuditSubscriber = (event: AuditEvent) => void;
