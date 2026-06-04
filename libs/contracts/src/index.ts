import { z } from "zod";

export const courseRoleSchema = z.enum(["student", "teacher", "admin"]);
export type CourseRole = z.infer<typeof courseRoleSchema>;

export const courseSchema = z.object({
  id: z.string().min(1),
  schoolId: z.string().min(1),
  title: z.string().min(1),
  term: z.string().min(1).optional(),
  ownerUserIds: z.array(z.string().min(1)),
  status: z.enum(["draft", "active", "archived"]),
});
export type Course = z.infer<typeof courseSchema>;

export const courseDocumentSchema = z.object({
  id: z.string().min(1),
  courseId: z.string().min(1),
  title: z.string().min(1),
  sourceType: z.enum(["pdf", "ppt", "word", "markdown", "web", "transcript"]),
  visibility: z.enum(["student", "teacher", "admin"]),
  ingestionStatus: z.enum(["pending", "indexed", "needs_review", "blocked"]),
});
export type CourseDocument = z.infer<typeof courseDocumentSchema>;

export const citationSchema = z.object({
  documentId: z.string().min(1),
  title: z.string().min(1),
  locator: z.string().min(1).optional(),
  excerpt: z.string().min(1).optional(),
  confidence: z.number().min(0).max(1).optional(),
});
export type Citation = z.infer<typeof citationSchema>;

export const conversationMessageSchema = z.object({
  id: z.string().min(1),
  conversationId: z.string().min(1),
  role: z.union([courseRoleSchema, z.enum(["assistant", "system"])]),
  content: z.string().min(1),
  citations: z.array(citationSchema).optional(),
  createdAt: z.string().datetime(),
});
export type ConversationMessage = z.infer<typeof conversationMessageSchema>;

export const teacherReviewStatusSchema = z.enum(["pending", "approved", "corrected", "rejected"]);
export type TeacherReviewStatus = z.infer<typeof teacherReviewStatusSchema>;

export const teacherReviewSchema = z.object({
  id: z.string().min(1),
  messageId: z.string().min(1),
  reviewerUserId: z.string().min(1).optional(),
  status: teacherReviewStatusSchema,
  correction: z.string().min(1).optional(),
  rubricNotes: z.string().min(1).optional(),
  createdAt: z.string().datetime(),
});
export type TeacherReview = z.infer<typeof teacherReviewSchema>;

export const ragTraceSchema = z.object({
  provider: z.enum(["mock", "dify", "ragflow", "custom"]),
  query: z.string().min(1),
  retrievedDocumentIds: z.array(z.string().min(1)),
  retrievalPolicy: z.enum(["course_visible_documents", "teacher_private_documents"]),
});
export type RagTrace = z.infer<typeof ragTraceSchema>;

export const answerRequestSchema = z.object({
  courseId: z.string().min(1),
  role: courseRoleSchema,
  question: z.string().trim().min(1),
});
export type AnswerRequest = z.infer<typeof answerRequestSchema>;

export const answerResponseSchema = z.object({
  conversationId: z.string().min(1),
  answerMessage: conversationMessageSchema,
  citations: z.array(citationSchema),
  ragTrace: ragTraceSchema,
  review: teacherReviewSchema,
  guardrails: z.array(z.string().min(1)),
});
export type AnswerResponse = z.infer<typeof answerResponseSchema>;

export const conversationLogEntrySchema = z.object({
  conversationId: z.string().min(1),
  courseId: z.string().min(1),
  role: courseRoleSchema,
  messages: z.array(conversationMessageSchema),
  citations: z.array(citationSchema),
  ragTrace: ragTraceSchema,
  review: teacherReviewSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type ConversationLogEntry = z.infer<typeof conversationLogEntrySchema>;

export const teacherReviewQueueItemSchema = z.object({
  review: teacherReviewSchema,
  course: courseSchema,
  conversationId: z.string().min(1),
  answerMessage: conversationMessageSchema,
  citations: z.array(citationSchema),
  ragTrace: ragTraceSchema,
});
export type TeacherReviewQueueItem = z.infer<typeof teacherReviewQueueItemSchema>;

export const teacherReviewQueueResponseSchema = z.object({
  items: z.array(teacherReviewQueueItemSchema),
});
export type TeacherReviewQueueResponse = z.infer<typeof teacherReviewQueueResponseSchema>;

export const teacherReviewActionSchema = z.object({
  status: z.enum(["approved", "corrected", "rejected"]),
  reviewerUserId: z.string().min(1).optional(),
  correction: z.string().trim().min(1).optional(),
  rubricNotes: z.string().trim().min(1).optional(),
});
export type TeacherReviewAction = z.infer<typeof teacherReviewActionSchema>;

export const teacherReviewActionResponseSchema = z.object({
  item: teacherReviewQueueItemSchema,
});
export type TeacherReviewActionResponse = z.infer<typeof teacherReviewActionResponseSchema>;

export const courseSnapshotSchema = z.object({
  course: courseSchema,
  documents: z.array(courseDocumentSchema),
  indexedChunks: z.number().int().nonnegative(),
  coveragePercent: z.number().min(0).max(100),
  pendingReviewCount: z.number().int().nonnegative(),
});
export type CourseSnapshot = z.infer<typeof courseSnapshotSchema>;
