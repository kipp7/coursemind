import { InMemoryAuditEventRepository } from "./in-memory-audit-event-repository";
import { InMemoryConversationRepository } from "./in-memory-conversation-repository";
import { SqliteAuditEventRepository } from "./sqlite-audit-event-repository";
import { SqliteConversationRepository } from "./sqlite-conversation-repository";
import { SqliteCourseDocumentRepository } from "./sqlite-course-document-repository";

const storageMode = process.env.COURSEMIND_STORAGE ?? "sqlite";

export const conversationRepository =
  storageMode === "in-memory" ? new InMemoryConversationRepository() : new SqliteConversationRepository();

export const auditEventRepository =
  storageMode === "in-memory" ? new InMemoryAuditEventRepository() : new SqliteAuditEventRepository();

export const courseDocumentRepository =
  storageMode === "in-memory" ? null : new SqliteCourseDocumentRepository();
