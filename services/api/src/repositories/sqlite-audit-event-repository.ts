import type { AuditEvent, CourseRole } from "@coursemind/contracts";
import type { AuditEventRepository, RecordAuditEventInput } from "./audit-event-repository";
import { getSqliteDatabase, parseJson, stringifyJson } from "./sqlite-database";

type AuditEventRow = {
  id: string;
  type: AuditEvent["type"];
  severity: AuditEvent["severity"];
  occurred_at: string;
  actor_role: CourseRole;
  actor_user_id: string | null;
  course_id: string | null;
  conversation_id: string | null;
  target_type: AuditEvent["targetType"];
  target_id: string | null;
  summary: string;
  metadata_json: string | null;
};

export class SqliteAuditEventRepository implements AuditEventRepository {
  async recordEvent(input: RecordAuditEventInput) {
    const database = getSqliteDatabase();
    const occurredAt = input.occurredAt ?? new Date().toISOString();
    const event: AuditEvent = {
      ...input,
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      occurredAt,
    };

    database
      .prepare(`
        INSERT INTO audit_events (
          id, type, severity, occurred_at, actor_role, actor_user_id, course_id, conversation_id,
          target_type, target_id, summary, metadata_json
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        event.id,
        event.type,
        event.severity,
        event.occurredAt,
        event.actorRole,
        event.actorUserId ?? null,
        event.courseId ?? null,
        event.conversationId ?? null,
        event.targetType,
        event.targetId ?? null,
        event.summary,
        event.metadata ? stringifyJson(event.metadata) : null,
      );

    return event;
  }

  async listEvents(limit = 50) {
    const rows = getSqliteDatabase()
      .prepare("SELECT * FROM audit_events ORDER BY occurred_at DESC LIMIT ?")
      .all(limit) as AuditEventRow[];

    return rows.map(toAuditEvent);
  }
}

function toAuditEvent(row: AuditEventRow): AuditEvent {
  return {
    id: row.id,
    type: row.type,
    severity: row.severity,
    occurredAt: row.occurred_at,
    actorRole: row.actor_role,
    actorUserId: row.actor_user_id ?? undefined,
    courseId: row.course_id ?? undefined,
    conversationId: row.conversation_id ?? undefined,
    targetType: row.target_type,
    targetId: row.target_id ?? undefined,
    summary: row.summary,
    metadata: row.metadata_json ? parseJson<Record<string, unknown>>(row.metadata_json) : undefined,
  };
}

export const sqliteAuditEventRepository = new SqliteAuditEventRepository();
