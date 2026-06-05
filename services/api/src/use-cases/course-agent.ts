import type {
  AuditEvent,
  AnswerRequest,
  AnswerResponse,
  AppLocale,
  CourseDocument,
  CourseDocumentCreateRequest,
  CourseDocumentCreateResponse,
  ConversationMessage,
  CourseSnapshot,
  TeacherReview,
  TeacherReviewAction,
  TeacherReviewQueueItem,
} from "@coursemind/contracts";
import { createModelGateway } from "../model/provider-registry";
import { createRagGateway } from "../rag/provider-registry";
import { auditEventRepository } from "../repositories/in-memory-audit-event-repository";
import { conversationRepository } from "../repositories/in-memory-conversation-repository";

type CourseMindCourseGlobal = typeof globalThis & {
  __coursemindCourseSnapshots?: CourseSnapshot[];
};

const defaultCourseSnapshots: CourseSnapshot[] = [
  {
    course: {
      id: "ai-101",
      schoolId: "demo-school",
      title: "Introduction to AI",
      term: "Spring 2026",
      ownerUserIds: ["teacher-li"],
      status: "active",
    },
    documents: [
      {
        id: "ai-syllabus",
        courseId: "ai-101",
        title: "Course syllabus",
        sourceType: "markdown",
        visibility: "student",
        ingestionStatus: "indexed",
      },
      {
        id: "ai-rag-lecture",
        courseId: "ai-101",
        title: "Lecture 4: RAG and course Q&A",
        sourceType: "ppt",
        visibility: "student",
        ingestionStatus: "indexed",
      },
      {
        id: "ai-review-rubric",
        courseId: "ai-101",
        title: "Teacher review rubric draft",
        sourceType: "word",
        visibility: "teacher",
        ingestionStatus: "needs_review",
      },
    ],
    indexedChunks: 4812,
    coveragePercent: 82,
    pendingReviewCount: 6,
  },
  {
    course: {
      id: "data-201",
      schoolId: "demo-school",
      title: "Data Structures",
      term: "Spring 2026",
      ownerUserIds: ["teacher-wang"],
      status: "active",
    },
    documents: [
      {
        id: "data-tree-notes",
        courseId: "data-201",
        title: "Trees and binary trees notes",
        sourceType: "pdf",
        visibility: "student",
        ingestionStatus: "indexed",
      },
      {
        id: "data-lab-queue",
        courseId: "data-201",
        title: "Lab 2: stacks and queues",
        sourceType: "word",
        visibility: "student",
        ingestionStatus: "indexed",
      },
    ],
    indexedChunks: 3407,
    coveragePercent: 76,
    pendingReviewCount: 3,
  },
];
const courseGlobal = globalThis as CourseMindCourseGlobal;
const courseSnapshots = courseGlobal.__coursemindCourseSnapshots ??= defaultCourseSnapshots;

export function getCourseSnapshots() {
  return courseSnapshots;
}

export async function createCourseDocument(
  courseId: string,
  request: CourseDocumentCreateRequest,
): Promise<CourseDocumentCreateResponse> {
  const snapshot = courseSnapshots.find((item) => item.course.id === courseId);

  if (!snapshot) {
    throw new Error(`Unknown course: ${courseId}`);
  }

  const document: CourseDocument = {
    id: `doc-${courseId}-${Date.now()}`,
    courseId,
    title: request.title,
    sourceType: request.sourceType,
    visibility: request.visibility,
    ingestionStatus: request.visibility === "teacher" ? "needs_review" : "pending",
  };

  snapshot.documents = [document, ...snapshot.documents];
  snapshot.pendingReviewCount += document.ingestionStatus === "needs_review" ? 1 : 0;

  await auditEventRepository.recordEvent({
    type: "course_document.ingestion_requested",
    severity: document.visibility === "student" ? "info" : "warning",
    actorRole: "teacher",
    actorUserId: request.actorUserId,
    courseId,
    targetType: "course_document",
    targetId: document.id,
    summary:
      request.locale === "zh-CN"
        ? `已为课程 ${getCourseTitle(snapshot, request.locale)} 创建资料入库任务：${request.title}。`
        : `Course document ingestion requested for ${snapshot.course.title}: ${request.title}.`,
    metadata: {
      sourceType: document.sourceType,
      visibility: document.visibility,
      ingestionStatus: document.ingestionStatus,
    },
  });

  return {
    snapshot,
    document,
  };
}

export async function answerCourseQuestion(request: AnswerRequest): Promise<AnswerResponse> {
  const snapshot = courseSnapshots.find((item) => item.course.id === request.courseId);

  if (!snapshot) {
    throw new Error(`Unknown course: ${request.courseId}`);
  }

  const ragGateway = createRagGateway();
  const retrieval = await ragGateway.retrieveCourseContext({
    courseId: snapshot.course.id,
    role: request.role,
    question: request.question,
    documents: snapshot.documents,
  });
  const citations = retrieval.citations;
  const locale = request.locale;
  const guardrails = getGuardrails(locale);
  const modelGateway = createModelGateway();
  const generation = await modelGateway.generateAnswer({
    request,
    courseSnapshot: snapshot,
    citations,
    guardrails,
  });
  const now = new Date().toISOString();
  const conversationId = `conv-${request.courseId}-demo`;
  const userMessageId = `msg-user-${Date.now()}`;
  const messageId = `msg-${Date.now()}`;
  const userMessage: ConversationMessage = {
    id: userMessageId,
    conversationId,
    role: request.role,
    content: request.question,
    createdAt: now,
  };
  const answerMessage: ConversationMessage = {
    id: messageId,
    conversationId,
    role: "assistant",
    content: generation.content,
    citations,
    createdAt: now,
  };
  const review: TeacherReview = {
    id: `review-${messageId}`,
    messageId,
    status: "pending",
    rubricNotes:
      locale === "zh-CN"
        ? "等待教师确认引用覆盖、课程规范和课堂表达是否合适。"
        : "Awaiting teacher confirmation for citation coverage and course policy fit.",
    createdAt: now,
  };

  await conversationRepository.saveAnswerRecord({
    request,
    course: snapshot.course,
    userMessage,
    answerMessage,
    citations,
    ragTrace: retrieval.trace,
    modelTrace: generation.trace,
    review,
  });
  await auditEventRepository.recordEvent({
    type: "agent.answer.created",
    severity: citations.length > 0 ? "info" : "warning",
    actorRole: request.role,
    courseId: snapshot.course.id,
    conversationId,
    targetType: "message",
    targetId: answerMessage.id,
    summary:
      locale === "zh-CN"
        ? `已为课程 ${getCourseTitle(snapshot, locale)} 创建智能体回答。`
        : `Course agent answer created for ${snapshot.course.title}.`,
    metadata: {
      citationCount: citations.length,
      ragProvider: retrieval.trace.provider,
      modelProvider: generation.trace.provider,
      model: generation.trace.model,
      reviewId: review.id,
      retrievedDocumentIds: retrieval.trace.retrievedDocumentIds,
      tokenUsage: generation.trace.tokenUsage,
    },
  });

  return {
    conversationId,
    answerMessage,
    citations,
    ragTrace: retrieval.trace,
    modelTrace: generation.trace,
    review,
    guardrails,
  };
}

export async function listTeacherReviewQueue(): Promise<TeacherReviewQueueItem[]> {
  return conversationRepository.listTeacherReviewQueue();
}

export async function listConversations() {
  return conversationRepository.listConversations();
}

export async function getConversation(conversationId: string) {
  return conversationRepository.getConversation(conversationId);
}

export async function updateTeacherReview(reviewId: string, action: TeacherReviewAction) {
  const item = await conversationRepository.updateTeacherReview(reviewId, action);

  await auditEventRepository.recordEvent({
    type: "teacher_review.updated",
    severity: action.status === "rejected" ? "warning" : "info",
    actorRole: "teacher",
    actorUserId: action.reviewerUserId,
    courseId: item.course.id,
    conversationId: item.conversationId,
    targetType: "teacher_review",
    targetId: reviewId,
    summary: `Teacher review marked ${action.status} for ${item.course.title}.`,
    metadata: {
      status: action.status,
      hasCorrection: Boolean(action.correction),
      hasRubricNotes: Boolean(action.rubricNotes),
      messageId: item.answerMessage.id,
    },
  });

  return item;
}

export async function listAuditEvents(): Promise<AuditEvent[]> {
  return auditEventRepository.listEvents();
}

function getGuardrails(locale: AppLocale) {
  if (locale === "zh-CN") {
    return [
      "仅基于当前角色可见的课程资料回答。",
      "展示引用；课程证据不足时要明确说明。",
      "避免直接替学生完成需要评分的作业或提交内容。",
    ];
  }

  return [
    "Answer only from visible course materials.",
    "Show citations and admit when course evidence is missing.",
    "Avoid directly completing graded student submissions.",
  ];
}

function getCourseTitle(snapshot: CourseSnapshot, locale: AppLocale) {
  if (locale === "zh-CN") {
    return snapshot.course.id === "data-201" ? "数据结构" : "人工智能导论";
  }

  return snapshot.course.title;
}
