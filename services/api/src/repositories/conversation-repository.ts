import type {
  AnswerRequest,
  Citation,
  ConversationLogEntry,
  ConversationMessage,
  Course,
  RagTrace,
  TeacherReview,
  TeacherReviewQueueItem,
} from "@coursemind/contracts";

export type SaveAnswerRecordInput = {
  request: AnswerRequest;
  course: Course;
  userMessage: ConversationMessage;
  answerMessage: ConversationMessage;
  citations: Citation[];
  ragTrace: RagTrace;
  review: TeacherReview;
};

export interface ConversationRepository {
  saveAnswerRecord(input: SaveAnswerRecordInput): Promise<ConversationLogEntry>;
  listTeacherReviewQueue(): Promise<TeacherReviewQueueItem[]>;
}
