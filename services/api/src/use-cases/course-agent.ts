import type {
  AuditEvent,
  AnswerRequest,
  AnswerResponse,
  AppLocale,
  Citation,
  CourseDocument,
  CourseDocumentCreateRequest,
  CourseDocumentCreateResponse,
  ConversationMessage,
  CourseSnapshot,
  TeacherReview,
  TeacherReviewAction,
  TeacherReviewQueueItem,
} from "@coursemind/contracts";
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
  const answer = composeAnswer(request, snapshot, citations);
  const locale = request.locale;
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
    content: answer,
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
      provider: retrieval.trace.provider,
      reviewId: review.id,
      retrievedDocumentIds: retrieval.trace.retrievedDocumentIds,
    },
  });

  return {
    conversationId,
    answerMessage,
    citations,
    ragTrace: retrieval.trace,
    review,
    guardrails: getGuardrails(locale),
  };
}

export async function listTeacherReviewQueue(): Promise<TeacherReviewQueueItem[]> {
  return conversationRepository.listTeacherReviewQueue();
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

function composeAnswer(request: AnswerRequest, snapshot: CourseSnapshot, citations: Citation[]) {
  const citationText = citations
    .map((citation, index) => `[${index + 1}] ${getCitationTitle(citation, request.locale)}`)
    .join(request.locale === "zh-CN" ? "、" : ", ");

  if (request.role === "teacher") {
    if (request.locale === "zh-CN") {
      return `这条回答应该进入教师审核队列。根据 ${citationText}，智能体需要先解释课程概念，再把引用自课件的内容和教师补充建议分开呈现。${getCourseTitle(snapshot, request.locale)} 当前还有 ${snapshot.pendingReviewCount} 条待审核记录。`;
    }

    return `This should enter the teacher review queue. Based on ${citationText}, the answer should explain the course concept first, then separate cited lecture material from teacher additions. ${snapshot.course.title} currently has ${snapshot.pendingReviewCount} pending review items.`;
  }

  if (request.role === "admin") {
    if (request.locale === "zh-CN") {
      return `从管理员视角看，这次回答已经记录了课程、角色、引用、护栏和审核状态。mock RAG 适配器检索到了 ${citations.length} 条证据。后续可以把 provider 切换到 Dify 或 RAGFlow，同时不让 Web 前端接触模型密钥。`;
    }

    return `From the admin view, this answer records course, role, citations, guardrails, and review status. The mock RAG adapter retrieved ${citations.length} evidence items. Later we can swap the provider to Dify or RAGFlow without exposing model credentials to the Web client.`;
  }

  if (request.locale === "zh-CN") {
    return `对 ${getCourseTitle(snapshot, request.locale)} 来说，MVP 阶段应该优先使用 RAG：先从当前课件、实验说明和教师 FAQ 中检索课程上下文，再由模型组织回答。微调应该等到学校积累了教师确认过的问答、评分标准和稳定规范之后再做。这条回答基于 ${citationText}，因此可以被教师审核和追踪，而不是只能盲目信任。`;
  }

  return `RAG is the right first step for ${snapshot.course.title}: it retrieves current lecture notes, labs, and teacher FAQs before the model writes the answer. Fine-tuning should wait until the school has teacher-approved answers, rubrics, and stable policy examples. This response is grounded in ${citationText}, so it can be audited instead of trusted blindly.`;
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

function getCitationTitle(citation: Citation, locale: AppLocale) {
  if (locale !== "zh-CN") {
    return citation.title;
  }

  const titleMap: Record<string, string> = {
    "ai-syllabus": "课程大纲",
    "ai-rag-lecture": "第 4 讲：RAG 与课程问答",
    "ai-review-rubric": "教师审核标准草案",
    "data-tree-notes": "树与二叉树讲义",
    "data-lab-queue": "实验 2：栈和队列",
  };

  return titleMap[citation.documentId] ?? citation.title;
}
