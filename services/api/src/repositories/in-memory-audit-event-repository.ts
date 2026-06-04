import type { AuditEvent } from "@coursemind/contracts";
import type { AuditEventRepository, RecordAuditEventInput } from "./audit-event-repository";

const auditEvents: AuditEvent[] = [];

export class InMemoryAuditEventRepository implements AuditEventRepository {
  async recordEvent(input: RecordAuditEventInput) {
    const event: AuditEvent = {
      ...input,
      id: `audit-${Date.now()}-${auditEvents.length + 1}`,
      occurredAt: input.occurredAt ?? new Date().toISOString(),
    };

    auditEvents.unshift(event);

    return event;
  }

  async listEvents(limit = 50) {
    return auditEvents.slice(0, limit);
  }
}

export const auditEventRepository = new InMemoryAuditEventRepository();
