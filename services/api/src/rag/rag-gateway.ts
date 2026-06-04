import type { AnswerRequest, Citation, CourseDocument, CourseRole, RagTrace } from "@coursemind/contracts";

export type RagProviderId = RagTrace["provider"];

export type RagRetrievalPolicy = RagTrace["retrievalPolicy"];

export type RagRetrievalRequest = {
  courseId: string;
  role: CourseRole;
  question: string;
  documents: CourseDocument[];
};

export type RagRetrievalResult = {
  citations: Citation[];
  trace: RagTrace;
};

export interface RagGateway {
  readonly provider: RagProviderId;
  retrieveCourseContext(request: RagRetrievalRequest): Promise<RagRetrievalResult>;
}

export function getRetrievalPolicy(role: AnswerRequest["role"]): RagRetrievalPolicy {
  return role === "teacher" || role === "admin" ? "teacher_private_documents" : "course_visible_documents";
}

export function getVisibleDocuments(request: RagRetrievalRequest) {
  if (request.role === "admin" || request.role === "teacher") {
    return request.documents.filter((document) => document.ingestionStatus !== "blocked");
  }

  return request.documents.filter(
    (document) => document.visibility === "student" && document.ingestionStatus === "indexed",
  );
}
