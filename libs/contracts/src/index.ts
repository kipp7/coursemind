import { z } from "zod";

export const courseRoleSchema = z.enum(["student", "teacher", "admin"]);
export type CourseRole = z.infer<typeof courseRoleSchema>;

export const appLocaleSchema = z.enum(["zh-CN", "en-US"]);
export type AppLocale = z.infer<typeof appLocaleSchema>;

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
  originalFileName: z.string().min(1).optional(),
  mimeType: z.string().min(1).optional(),
  sizeBytes: z.number().int().nonnegative().optional(),
  storagePath: z.string().min(1).optional(),
  uploadedAt: z.string().datetime().optional(),
});
export type CourseDocument = z.infer<typeof courseDocumentSchema>;

export const courseDocumentCreateRequestSchema = z.object({
  title: z.string().trim().min(1),
  sourceType: z.enum(["pdf", "ppt", "word", "markdown", "web", "transcript"]),
  visibility: z.enum(["student", "teacher", "admin"]),
  actorUserId: z.string().min(1).optional(),
  locale: appLocaleSchema.default("zh-CN"),
  originalFileName: z.string().min(1).optional(),
  mimeType: z.string().min(1).optional(),
  sizeBytes: z.number().int().nonnegative().optional(),
  storagePath: z.string().min(1).optional(),
});
export type CourseDocumentCreateRequest = z.infer<typeof courseDocumentCreateRequestSchema>;

export const courseDocumentCreateResponseSchema = z.object({
  snapshot: z.lazy(() => courseSnapshotSchema),
  document: courseDocumentSchema,
});
export type CourseDocumentCreateResponse = z.infer<typeof courseDocumentCreateResponseSchema>;

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

export const modelTraceSchema = z.object({
  provider: z.enum(["mock", "openai-compatible", "custom"]),
  model: z.string().min(1),
  promptPolicy: z.enum(["student_course_answer", "teacher_review_draft", "admin_audit_summary"]),
  tokenUsage: z
    .object({
      promptTokens: z.number().int().nonnegative().optional(),
      completionTokens: z.number().int().nonnegative().optional(),
      totalTokens: z.number().int().nonnegative().optional(),
    })
    .optional(),
});
export type ModelTrace = z.infer<typeof modelTraceSchema>;

export const answerRequestSchema = z.object({
  courseId: z.string().min(1),
  role: courseRoleSchema,
  question: z.string().trim().min(1),
  locale: appLocaleSchema.default("zh-CN"),
});
export type AnswerRequest = z.infer<typeof answerRequestSchema>;

export const answerResponseSchema = z.object({
  conversationId: z.string().min(1),
  answerMessage: conversationMessageSchema,
  citations: z.array(citationSchema),
  ragTrace: ragTraceSchema,
  modelTrace: modelTraceSchema,
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
  modelTrace: modelTraceSchema,
  review: teacherReviewSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type ConversationLogEntry = z.infer<typeof conversationLogEntrySchema>;

export const conversationSummarySchema = z.object({
  conversationId: z.string().min(1),
  courseId: z.string().min(1),
  role: courseRoleSchema,
  title: z.string().min(1),
  lastMessagePreview: z.string().min(1),
  messageCount: z.number().int().nonnegative(),
  reviewStatus: teacherReviewStatusSchema,
  ragProvider: ragTraceSchema.shape.provider,
  modelProvider: modelTraceSchema.shape.provider,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type ConversationSummary = z.infer<typeof conversationSummarySchema>;

export const conversationListResponseSchema = z.object({
  items: z.array(conversationSummarySchema),
});
export type ConversationListResponse = z.infer<typeof conversationListResponseSchema>;

export const conversationDetailResponseSchema = z.object({
  item: conversationLogEntrySchema,
});
export type ConversationDetailResponse = z.infer<typeof conversationDetailResponseSchema>;

export const teacherReviewQueueItemSchema = z.object({
  review: teacherReviewSchema,
  course: courseSchema,
  conversationId: z.string().min(1),
  answerMessage: conversationMessageSchema,
  citations: z.array(citationSchema),
  ragTrace: ragTraceSchema,
  modelTrace: modelTraceSchema,
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

export const auditEventTypeSchema = z.enum([
  "agent.answer.created",
  "course_document.ingestion_requested",
  "teacher_review.updated",
]);
export type AuditEventType = z.infer<typeof auditEventTypeSchema>;

export const auditEventSeveritySchema = z.enum(["info", "warning", "critical"]);
export type AuditEventSeverity = z.infer<typeof auditEventSeveritySchema>;

export const auditEventSchema = z.object({
  id: z.string().min(1),
  type: auditEventTypeSchema,
  severity: auditEventSeveritySchema,
  occurredAt: z.string().datetime(),
  actorRole: courseRoleSchema,
  actorUserId: z.string().min(1).optional(),
  courseId: z.string().min(1).optional(),
  conversationId: z.string().min(1).optional(),
  targetType: z.enum(["conversation", "message", "teacher_review", "course", "course_document"]),
  targetId: z.string().min(1).optional(),
  summary: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export type AuditEvent = z.infer<typeof auditEventSchema>;

export const auditEventListResponseSchema = z.object({
  items: z.array(auditEventSchema),
});
export type AuditEventListResponse = z.infer<typeof auditEventListResponseSchema>;

export const courseSnapshotSchema = z.object({
  course: courseSchema,
  documents: z.array(courseDocumentSchema),
  indexedChunks: z.number().int().nonnegative(),
  coveragePercent: z.number().min(0).max(100),
  pendingReviewCount: z.number().int().nonnegative(),
});
export type CourseSnapshot = z.infer<typeof courseSnapshotSchema>;
