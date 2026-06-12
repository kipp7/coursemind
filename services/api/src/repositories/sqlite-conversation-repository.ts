import type {
  Citation,
  ConversationLogEntry,
  ConversationMessage,
  ConversationSummary,
  Course,
  CourseRole,
  ModelTrace,
  RagTrace,
  TeacherReview,
  TeacherReviewAction,
  TeacherReviewQueueItem,
} from "@coursemind/contracts";
import type { ConversationRepository, SaveAnswerRecordInput } from "./conversation-repository";
import { getSqliteDatabase, parseJson, stringifyJson } from "./sqlite-database";

type ConversationRow = {
  id: string;
  course_id: string;
  role: CourseRole;
  messages_json: string;
  citations_json: string;
  rag_trace_json: string;
  model_trace_json: string;
  review_json: string;
  created_at: string;
  updated_at: string;
};

type TeacherReviewRow = {
  id: string;
  conversation_id: string;
  course_json: string;
  answer_message_json: string;
  citations_json: string;
  rag_trace_json: string;
  model_trace_json: string;
  review_json: string;
  created_at: string;
  updated_at: string;
};

export class SqliteConversationRepository implements ConversationRepository {
  async saveAnswerRecord(input: SaveAnswerRecordInput) {
    const database = getSqliteDatabase();
    const now = new Date().toISOString();
    const existing = database
      .prepare("SELECT * FROM conversations WHERE id = ?")
      .get(input.answerMessage.conversationId) as ConversationRow | undefined;
    const existingMessages = existing ? parseJson<ConversationMessage[]>(existing.messages_json) : [];
    const entry: ConversationLogEntry = {
      conversationId: input.answerMessage.conversationId,
      courseId: input.request.courseId,
      role: input.request.role,
      messages: [...existingMessages, input.userMessage, input.answerMessage],
      citations: input.citations,
      ragTrace: input.ragTrace,
      modelTrace: input.modelTrace,
      review: input.review,
      createdAt: existing?.created_at ?? now,
      updatedAt: now,
    };

    database
      .prepare(`
        INSERT INTO conversations (
          id, course_id, role, messages_json, citations_json, rag_trace_json, model_trace_json, review_json, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          course_id = excluded.course_id,
          role = excluded.role,
          messages_json = excluded.messages_json,
          citations_json = excluded.citations_json,
          rag_trace_json = excluded.rag_trace_json,
          model_trace_json = excluded.model_trace_json,
          review_json = excluded.review_json,
          updated_at = excluded.updated_at
      `)
      .run(
        entry.conversationId,
        entry.courseId,
        entry.role,
        stringifyJson(entry.messages),
        stringifyJson(entry.citations),
        stringifyJson(entry.ragTrace),
        stringifyJson(entry.modelTrace),
        stringifyJson(entry.review),
        entry.createdAt,
        entry.updatedAt,
      );

    database
      .prepare(`
        INSERT INTO teacher_review_items (
          id, conversation_id, course_json, answer_message_json, citations_json, rag_trace_json, model_trace_json,
          review_json, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          conversation_id = excluded.conversation_id,
          course_json = excluded.course_json,
          answer_message_json = excluded.answer_message_json,
          citations_json = excluded.citations_json,
          rag_trace_json = excluded.rag_trace_json,
          model_trace_json = excluded.model_trace_json,
          review_json = excluded.review_json,
          updated_at = excluded.updated_at
      `)
      .run(
        input.review.id,
        entry.conversationId,
        stringifyJson(input.course),
        stringifyJson(input.answerMessage),
        stringifyJson(input.citations),
        stringifyJson(input.ragTrace),
        stringifyJson(input.modelTrace),
        stringifyJson(input.review),
        input.review.createdAt,
        now,
      );

    return entry;
  }

  async listConversations() {
    const rows = getSqliteDatabase()
      .prepare("SELECT * FROM conversations ORDER BY updated_at DESC")
      .all() as ConversationRow[];

    return rows.map((row) => toConversationSummary(toConversationLogEntry(row)));
  }

  async getConversation(conversationId: string) {
    const row = getSqliteDatabase()
      .prepare("SELECT * FROM conversations WHERE id = ?")
      .get(conversationId) as ConversationRow | undefined;

    if (!row) {
      throw new Error(`Unknown conversation: ${conversationId}`);
    }

    return toConversationLogEntry(row);
  }

  async listTeacherReviewQueue() {
    const rows = getSqliteDatabase()
      .prepare("SELECT * FROM teacher_review_items ORDER BY created_at DESC")
      .all() as TeacherReviewRow[];

    return rows.map(toTeacherReviewQueueItem);
  }

  async updateTeacherReview(reviewId: string, action: TeacherReviewAction) {
    const database = getSqliteDatabase();
    const row = database
      .prepare("SELECT * FROM teacher_review_items WHERE id = ?")
      .get(reviewId) as TeacherReviewRow | undefined;

    if (!row) {
      throw new Error(`Unknown teacher review: ${reviewId}`);
    }

    const item = toTeacherReviewQueueItem(row);
    const updatedReview: TeacherReview = {
      ...item.review,
      reviewerUserId: action.reviewerUserId,
      status: action.status,
      correction: action.correction,
      rubricNotes: action.rubricNotes ?? item.review.rubricNotes,
    };
    const now = new Date().toISOString();

    database
      .prepare("UPDATE teacher_review_items SET review_json = ?, updated_at = ? WHERE id = ?")
      .run(stringifyJson(updatedReview), now, reviewId);

    const conversationRow = database
      .prepare("SELECT * FROM conversations WHERE id = ?")
      .get(item.conversationId) as ConversationRow | undefined;

    if (conversationRow) {
      database
        .prepare("UPDATE conversations SET review_json = ?, updated_at = ? WHERE id = ?")
        .run(stringifyJson(updatedReview), now, item.conversationId);
    }

    return {
      ...item,
      review: updatedReview,
    };
  }
}

function toConversationLogEntry(row: ConversationRow): ConversationLogEntry {
  return {
    conversationId: row.id,
    courseId: row.course_id,
    role: row.role,
    messages: parseJson<ConversationMessage[]>(row.messages_json),
    citations: parseJson<Citation[]>(row.citations_json),
    ragTrace: parseJson<RagTrace>(row.rag_trace_json),
    modelTrace: parseJson<ModelTrace>(row.model_trace_json),
    review: parseJson<TeacherReview>(row.review_json),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toTeacherReviewQueueItem(row: TeacherReviewRow): TeacherReviewQueueItem {
  return {
    review: parseJson<TeacherReview>(row.review_json),
    course: parseJson<Course>(row.course_json),
    conversationId: row.conversation_id,
    answerMessage: parseJson<ConversationMessage>(row.answer_message_json),
    citations: parseJson<Citation[]>(row.citations_json),
    ragTrace: parseJson<RagTrace>(row.rag_trace_json),
    modelTrace: parseJson<ModelTrace>(row.model_trace_json),
  };
}

function toConversationSummary(entry: ConversationLogEntry): ConversationSummary {
  const firstUserMessage = entry.messages.find((message) => message.role !== "assistant" && message.role !== "system");
  const lastMessage = entry.messages.at(-1);

  return {
    conversationId: entry.conversationId,
    courseId: entry.courseId,
    role: entry.role,
    title: toPreview(firstUserMessage ?? lastMessage),
    lastMessagePreview: toPreview(lastMessage),
    messageCount: entry.messages.length,
    reviewStatus: entry.review.status,
    ragProvider: entry.ragTrace.provider,
    modelProvider: entry.modelTrace.provider,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  };
}

function toPreview(message: ConversationMessage | undefined) {
  const fallback = "Untitled conversation";
  const content = message?.content.trim() || fallback;

  return content.length > 80 ? `${content.slice(0, 77)}...` : content;
}

export const sqliteConversationRepository = new SqliteConversationRepository();
