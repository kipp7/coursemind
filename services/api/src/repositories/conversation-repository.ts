import type {
  AnswerRequest,
  Citation,
  ConversationLogEntry,
  ConversationMessage,
  ConversationSummary,
  Course,
  ModelTrace,
  RagTrace,
  TeacherReview,
  TeacherReviewAction,
  TeacherReviewQueueItem,
} from "@coursemind/contracts";

export type SaveAnswerRecordInput = {
  request: AnswerRequest;
  course: Course;
  userMessage: ConversationMessage;
  answerMessage: ConversationMessage;
  citations: Citation[];
  ragTrace: RagTrace;
  modelTrace: ModelTrace;
  review: TeacherReview;
};

export interface ConversationRepository {
  saveAnswerRecord(input: SaveAnswerRecordInput): Promise<ConversationLogEntry>;
  listConversations(): Promise<ConversationSummary[]>;
  getConversation(conversationId: string): Promise<ConversationLogEntry>;
  listTeacherReviewQueue(): Promise<TeacherReviewQueueItem[]>;
  updateTeacherReview(reviewId: string, action: TeacherReviewAction): Promise<TeacherReviewQueueItem>;
}
