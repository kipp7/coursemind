import type { AnswerRequest, Citation, CourseSnapshot, ModelTrace } from "@coursemind/contracts";

export type ModelProviderId = ModelTrace["provider"];

export type ModelPromptPolicy = ModelTrace["promptPolicy"];

export type ModelGenerationRequest = {
  request: AnswerRequest;
  courseSnapshot: CourseSnapshot;
  citations: Citation[];
  guardrails: string[];
};

export type ModelGenerationResult = {
  content: string;
  trace: ModelTrace;
};

export interface ModelGateway {
  readonly provider: ModelProviderId;
  generateAnswer(request: ModelGenerationRequest): Promise<ModelGenerationResult>;
}

export function getPromptPolicy(role: AnswerRequest["role"]): ModelPromptPolicy {
  if (role === "admin") {
    return "admin_audit_summary";
  }

  if (role === "teacher") {
    return "teacher_review_draft";
  }

  return "student_course_answer";
}
