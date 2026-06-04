# CourseMind Technical Architecture

## Architecture Goal

CourseMind should start as a Web MVP, but its technical shape should support a future school-facing platform: multiple courses, multiple roles, auditable RAG answers, teacher review, replaceable model providers, and optional private deployment.

## System Layers

```text
Web Client
  -> Application API
  -> Agent Orchestration
  -> RAG Gateway
  -> Model Gateway
  -> Storage and Governance
```

## Layer Responsibilities

### Web Client

- Student course Q&A
- Teacher course material and FAQ management
- Admin provider, course, usage, and audit surfaces
- Citation display and teacher review UI

The current MVP is a Next.js App Router application under `apps/web`. It is still a mocked interaction proof, but it now uses the intended Web stack.

### Application API

This is our own business backend. Do not outsource this layer entirely to Dify or RAGFlow.

Responsibilities:

- authentication and user identity
- role and course permissions
- conversation lifecycle
- course document upload metadata
- teacher review workflow
- audit logging and cost tracking
- calls into agent/RAG/model providers

### Agent Orchestration

The orchestration layer decides how to answer a request:

```text
identify user and course
  -> classify intent
  -> enforce role rules
  -> retrieve course context
  -> call model
  -> validate citation coverage
  -> apply safety and teaching policies
  -> return answer and trace
```

MVP can use Dify workflow capabilities here. Later versions can use LangGraph, LlamaIndex, or a custom orchestrator when control requirements increase.

### RAG Gateway

The RAG gateway hides the selected RAG platform behind an adapter boundary.

Supported provider direction:

- Dify knowledge base for fast MVP delivery
- RAGFlow for stronger document parsing and complex course materials
- self-hosted vector database later if school deployment requires deeper control

The application should talk to `rag-gateway`, not directly to a provider-specific API.

### Model Gateway

The model gateway should expose OpenAI-compatible semantics where possible.

Candidate providers:

- OpenAI-compatible cloud APIs
- Qwen
- DeepSeek
- GLM
- vLLM private deployment
- Ollama local development

The frontend must never call model providers directly.

### Storage And Governance

Expected data domains:

- school, department, course
- user, role, enrollment
- document, chunk, citation
- conversation, message, model call
- review task, teacher correction, rubric
- policy rule, audit event, cost event

MVP can mock or defer parts of storage, but the architecture should preserve these boundaries.

The MVP now has a mock persistence boundary in `services/api/src/repositories`:

- `ConversationRepository` defines the application-facing storage interface.
- `InMemoryConversationRepository` stores conversation messages, citations, RAG traces, and teacher review queue items for the running server process.
- `AuditEventRepository` defines the application-facing audit log interface.
- `InMemoryAuditEventRepository` stores answer-created and teacher-review-updated events for the running server process.
- `/api/teacher/reviews` exposes the current teacher review queue for the Web demo.
- `/api/teacher/reviews/[reviewId]` lets the demo approve, correct, or reject a pending teacher review.
- `/api/audit/events` exposes the current audit trail for the Web demo.

This is not durable database storage. It exists to prove the school review and audit boundary before introducing Prisma/PostgreSQL or another production store.

## RAG Before Fine-Tuning

RAG is the first implementation priority because course materials change frequently. Fine-tuning should wait until the project has teacher-approved examples, review records, and stable rubric data.

RAG teaches the system current course content. Fine-tuning later teaches the system stable behavior: teacher style, scoring standards, refusal boundaries, and school-specific answer conventions.

## MVP Vertical Slice

The first serious MVP should prove:

```text
student asks question
  -> course context is selected
  -> RAG returns cited materials
  -> model generates answer
  -> citations are displayed
  -> teacher can review or correct the answer
  -> audit events record answer and review actions
```

## Key Risks

- Hallucination: require citations and retrieval traces.
- Permission leakage: separate student, teacher, and admin document visibility.
- Academic integrity: do not directly complete graded assignments for students.
- Privacy: protect student questions and learning records.
- Cost: record model usage and add throttling/caching later.
- Vendor lock-in: keep provider integrations behind adapters.
