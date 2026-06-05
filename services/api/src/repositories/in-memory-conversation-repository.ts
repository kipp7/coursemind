import type {
  ConversationLogEntry,
  ConversationMessage,
  ConversationSummary,
  TeacherReviewAction,
  TeacherReviewQueueItem,
} from "@coursemind/contracts";
import type { ConversationRepository, SaveAnswerRecordInput } from "./conversation-repository";

type CourseMindConversationGlobal = typeof globalThis & {
  __coursemindConversationLog?: Map<string, ConversationLogEntry>;
  __coursemindReviewQueue?: Map<string, TeacherReviewQueueItem>;
};

const conversationGlobal = globalThis as CourseMindConversationGlobal;
const conversationLog = conversationGlobal.__coursemindConversationLog ??= new Map();
const reviewQueue = conversationGlobal.__coursemindReviewQueue ??= new Map();

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
      modelTrace: input.modelTrace,
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
      modelTrace: input.modelTrace,
    });

    return entry;
  }

  async listConversations() {
    return Array.from(conversationLog.values()).map(toConversationSummary).sort((left, right) =>
      right.updatedAt.localeCompare(left.updatedAt),
    );
  }

  async getConversation(conversationId: string) {
    const entry = conversationLog.get(conversationId);

    if (!entry) {
      throw new Error(`Unknown conversation: ${conversationId}`);
    }

    return entry;
  }

  async listTeacherReviewQueue() {
    return Array.from(reviewQueue.values()).sort((left, right) =>
      right.review.createdAt.localeCompare(left.review.createdAt),
    );
  }

  async updateTeacherReview(reviewId: string, action: TeacherReviewAction) {
    const item = reviewQueue.get(reviewId);

    if (!item) {
      throw new Error(`Unknown teacher review: ${reviewId}`);
    }

    const updatedItem: TeacherReviewQueueItem = {
      ...item,
      review: {
        ...item.review,
        reviewerUserId: action.reviewerUserId,
        status: action.status,
        correction: action.correction,
        rubricNotes: action.rubricNotes ?? item.review.rubricNotes,
      },
    };
    const conversation = conversationLog.get(item.conversationId);

    if (conversation) {
      conversationLog.set(item.conversationId, {
        ...conversation,
        review: updatedItem.review,
        updatedAt: new Date().toISOString(),
      });
    }

    reviewQueue.set(reviewId, updatedItem);

    return updatedItem;
  }
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

export const conversationRepository = new InMemoryConversationRepository();
