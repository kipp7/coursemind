import type { AuditEvent } from "@coursemind/contracts";

export type RecordAuditEventInput = Omit<AuditEvent, "id" | "occurredAt"> & {
  occurredAt?: string;
};

export interface AuditEventRepository {
  recordEvent(input: RecordAuditEventInput): Promise<AuditEvent>;
  listEvents(limit?: number): Promise<AuditEvent[]>;
}
