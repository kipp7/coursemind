export type CourseRole = "student" | "teacher" | "admin";

export type Course = {
  id: string;
  schoolId: string;
  title: string;
  term?: string;
  ownerUserIds: string[];
  status: "draft" | "active" | "archived";
};

export type CourseDocument = {
  id: string;
  courseId: string;
  title: string;
  sourceType: "pdf" | "ppt" | "word" | "markdown" | "web" | "transcript";
  visibility: "student" | "teacher" | "admin";
  ingestionStatus: "pending" | "indexed" | "needs_review" | "blocked";
};

export type Citation = {
  documentId: string;
  title: string;
  locator?: string;
  excerpt?: string;
  confidence?: number;
};

export type ConversationMessage = {
  id: string;
  conversationId: string;
  role: CourseRole | "assistant" | "system";
  content: string;
  citations?: Citation[];
  createdAt: string;
};

export type TeacherReviewStatus = "pending" | "approved" | "corrected" | "rejected";

export type TeacherReview = {
  id: string;
  messageId: string;
  reviewerUserId?: string;
  status: TeacherReviewStatus;
  correction?: string;
  rubricNotes?: string;
  createdAt: string;
};

export type RagTrace = {
  provider: "mock" | "dify" | "ragflow" | "custom";
  query: string;
  retrievedDocumentIds: string[];
  retrievalPolicy: "course_visible_documents" | "teacher_private_documents";
};

export type AnswerRequest = {
  courseId: string;
  role: CourseRole;
  question: string;
};

export type AnswerResponse = {
  conversationId: string;
  answerMessage: ConversationMessage;
  citations: Citation[];
  ragTrace: RagTrace;
  review: TeacherReview;
  guardrails: string[];
};

export type CourseSnapshot = {
  course: Course;
  documents: CourseDocument[];
  indexedChunks: number;
  coveragePercent: number;
  pendingReviewCount: number;
};
