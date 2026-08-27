import { AuditEvent, AuditSubscriber } from "./types";

const events: AuditEvent[] = [];
const subscribers: AuditSubscriber[] = [];

export function subscribe(callback: AuditSubscriber): () => void {
  subscribers.push(callback);
  return () => {
    const idx = subscribers.indexOf(callback);
    if (idx !== -1) subscribers.splice(idx, 1);
  };
}

export function emit(event: Omit<AuditEvent, "id" | "timestamp">): AuditEvent {
  const full: AuditEvent = {
    ...event,
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
  };
  events.push(full);
  subscribers.forEach((cb) => cb(full));
  return full;
}

export function list(toolId?: string, recordId?: string): AuditEvent[] {
  let result = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  if (toolId) result = result.filter((e) => e.toolId === toolId);
  if (recordId) result = result.filter((e) => e.recordId === recordId);
  return result;
}

export function clear(): void {
  events.length = 0;
}
