import type {
  AnswerRequest,
  AnswerResponse,
  Citation,
  CourseSnapshot,
  RagTrace,
} from "@coursemind/contracts";

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

  const citations = retrieveCourseContext(request, snapshot);
  const answer = composeAnswer(request, snapshot, citations);
  const now = new Date().toISOString();
  const conversationId = `conv-${request.courseId}-demo`;
  const messageId = `msg-${Date.now()}`;
  const ragTrace: RagTrace = {
    provider: "mock",
    query: request.question,
    retrievedDocumentIds: citations.map((citation) => citation.documentId),
    retrievalPolicy:
      request.role === "teacher" || request.role === "admin"
        ? "teacher_private_documents"
        : "course_visible_documents",
  };

  return {
    conversationId,
    answerMessage: {
      id: messageId,
      conversationId,
      role: "assistant",
      content: answer,
      citations,
      createdAt: now,
    },
    citations,
    ragTrace,
    review: {
      id: `review-${messageId}`,
      messageId,
      status: "pending",
      rubricNotes: "Awaiting teacher confirmation for citation coverage and course policy fit.",
      createdAt: now,
    },
    guardrails: [
      "Answer only from visible course materials.",
      "Show citations and admit when course evidence is missing.",
      "Avoid directly completing graded student submissions.",
    ],
  };
}

function retrieveCourseContext(request: AnswerRequest, snapshot: CourseSnapshot): Citation[] {
  const visibleDocuments = snapshot.documents.filter((document) => {
    if (request.role === "admin" || request.role === "teacher") {
      return document.ingestionStatus !== "blocked";
    }

    return document.visibility === "student" && document.ingestionStatus === "indexed";
  });

  return visibleDocuments.slice(0, 3).map((document, index) => ({
    documentId: document.id,
    title: document.title,
    locator: index === 0 ? "core section" : `chunk ${index + 1}`,
    excerpt: buildExcerpt(request.question, document.title),
    confidence: Number((0.86 - index * 0.08).toFixed(2)),
  }));
}

function buildExcerpt(question: string, title: string) {
  const lower = question.toLowerCase();

  if (lower.includes("fine") || lower.includes("tuning") || lower.includes("rag")) {
    return `${title} says frequently changing course content should be handled through retrieval before fine-tuning.`;
  }

  if (lower.includes("homework") || lower.includes("rubric") || lower.includes("grade")) {
    return `${title} asks the assistant to explain grading criteria without replacing the student's own work.`;
  }

  return `${title} contains course definitions, classroom rules, and teacher notes relevant to the question.`;
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
