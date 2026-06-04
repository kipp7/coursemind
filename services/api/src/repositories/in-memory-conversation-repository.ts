import type { ConversationLogEntry, TeacherReviewQueueItem } from "@coursemind/contracts";
import type { ConversationRepository, SaveAnswerRecordInput } from "./conversation-repository";

const conversationLog = new Map<string, ConversationLogEntry>();
const reviewQueue = new Map<string, TeacherReviewQueueItem>();

export class InMemoryConversationRepository implements ConversationRepository {
  async saveAnswerRecord(input: SaveAnswerRecordInput) {
    const now = new Date().toISOString();
    const existing = conversationLog.get(input.answerMessage.conversationId);
    const entry: ConversationLogEntry = {
      conversationId: input.answerMessage.conversationId,
      courseId: input.request.courseId,
      role: input.request.role,
      messages: [...(existing?.messages ?? []), input.userMessage, input.answerMessage],
      citations: input.citations,
      ragTrace: input.ragTrace,
      review: input.review,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    conversationLog.set(entry.conversationId, entry);
    reviewQueue.set(input.review.id, {
      review: input.review,
      course: input.course,
      conversationId: entry.conversationId,
      answerMessage: input.answerMessage,
      citations: input.citations,
      ragTrace: input.ragTrace,
    });

    return entry;
  }

  async listTeacherReviewQueue() {
    return Array.from(reviewQueue.values()).sort((left, right) =>
      right.review.createdAt.localeCompare(left.review.createdAt),
    );
  }
}

export const conversationRepository = new InMemoryConversationRepository();
