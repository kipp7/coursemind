# Initial Contracts

These contracts describe the first shared objects the frontend, API, RAG gateway, and model gateway should converge on.

The initial implementation now lives in `libs/contracts/src/index.ts`. Keep this document as the human-readable contract guide and update the package when shapes change.

Contracts are now schema-first with Zod. Types are inferred from runtime schemas so API routes can validate input and output instead of relying only on TypeScript compile-time checks.

Current runtime validation:

- `/api/agent/answer` validates request JSON with `answerRequestSchema`.
- `/api/agent/answer` validates the generated response with `answerResponseSchema` before returning it.
- Invalid requests return `400` with field-level details.
- Provider configuration failures return `503`.

Conversation and review DTOs now include:

- `ConversationLogEntry`
- `TeacherReviewQueueItem`
- `TeacherReviewQueueResponse`
- `TeacherReviewAction`
- `TeacherReviewActionResponse`

These represent the mock persistence boundary for the MVP. They should be preserved when the in-memory repository is replaced by real database storage.

## Course

```ts
type Course = {
  id: string;
  schoolId: string;
  title: string;
  term?: string;
  ownerUserIds: string[];
  status: "draft" | "active" | "archived";
};
```

## Document

```ts
type CourseDocument = {
  id: string;
  courseId: string;
  title: string;
  sourceType: "pdf" | "ppt" | "word" | "markdown" | "web" | "transcript";
  visibility: "student" | "teacher" | "admin";
  ingestionStatus: "pending" | "indexed" | "needs_review" | "blocked";
};
```

## Citation

```ts
type Citation = {
  documentId: string;
  title: string;
  locator?: string;
  excerpt?: string;
  confidence?: number;
};
```

## Conversation Message

```ts
type ConversationMessage = {
  id: string;
  conversationId: string;
  role: "student" | "teacher" | "admin" | "assistant" | "system";
  content: string;
  citations?: Citation[];
  createdAt: string;
};
```

## Teacher Review

```ts
type TeacherReview = {
  id: string;
  messageId: string;
  reviewerUserId: string;
  status: "approved" | "corrected" | "rejected";
  correction?: string;
  rubricNotes?: string;
  createdAt: string;
};
```

## Model Trace

```ts
type ModelTrace = {
  provider: "mock" | "openai-compatible" | "custom";
  model: string;
  promptPolicy: "student_course_answer" | "teacher_review_draft" | "admin_audit_summary";
  tokenUsage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
};
```

## Design Rule

Frontend code should consume these shapes through a shared contracts package later. It should not invent provider-specific response shapes directly in UI components.
