import type { AuditEvent } from "@coursemind/contracts";
import type { AuditEventRepository, RecordAuditEventInput } from "./audit-event-repository";

type CourseMindAuditGlobal = typeof globalThis & {
  __coursemindAuditEvents?: AuditEvent[];
};

const auditGlobal = globalThis as CourseMindAuditGlobal;
const auditEvents = auditGlobal.__coursemindAuditEvents ??= [];

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
