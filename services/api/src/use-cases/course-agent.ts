import type {
  AnswerRequest,
  AnswerResponse,
  Citation,
  ConversationMessage,
  CourseSnapshot,
  TeacherReview,
  TeacherReviewAction,
  TeacherReviewQueueItem,
} from "@coursemind/contracts";
import { createRagGateway } from "../rag/provider-registry";
import { conversationRepository } from "../repositories/in-memory-conversation-repository";

const courseSnapshots: CourseSnapshot[] = [
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

export function getCourseSnapshots() {
  return courseSnapshots;
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
    rubricNotes: "Awaiting teacher confirmation for citation coverage and course policy fit.",
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

  return {
    conversationId,
    answerMessage,
    citations,
    ragTrace: retrieval.trace,
    review,
    guardrails: [
      "Answer only from visible course materials.",
      "Show citations and admit when course evidence is missing.",
      "Avoid directly completing graded student submissions.",
    ],
  };
}

export async function listTeacherReviewQueue(): Promise<TeacherReviewQueueItem[]> {
  return conversationRepository.listTeacherReviewQueue();
}

export async function updateTeacherReview(reviewId: string, action: TeacherReviewAction) {
  return conversationRepository.updateTeacherReview(reviewId, action);
}

function composeAnswer(request: AnswerRequest, snapshot: CourseSnapshot, citations: Citation[]) {
  const citationText = citations.map((citation, index) => `[${index + 1}] ${citation.title}`).join(", ");

  if (request.role === "teacher") {
    return `This should enter the teacher review queue. Based on ${citationText}, the answer should explain the course concept first, then separate cited lecture material from teacher additions. ${snapshot.course.title} currently has ${snapshot.pendingReviewCount} pending review items.`;
  }

  if (request.role === "admin") {
    return `From the admin view, this answer records course, role, citations, guardrails, and review status. The mock RAG adapter retrieved ${citations.length} evidence items. Later we can swap the provider to Dify or RAGFlow without exposing model credentials to the Web client.`;
  }

  return `RAG is the right first step for ${snapshot.course.title}: it retrieves current lecture notes, labs, and teacher FAQs before the model writes the answer. Fine-tuning should wait until the school has teacher-approved answers, rubrics, and stable policy examples. This response is grounded in ${citationText}, so it can be audited instead of trusted blindly.`;
}
