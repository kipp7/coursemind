# Task: MVP Web Course Agent

## Goal

Build a Web MVP for CourseMind that demonstrates a school-ready course agent experience and preserves the future platform architecture.

## Current State

- Static Web prototype exists at the project root.
- Workspace memory and context scaffold has been installed.
- Project-specific `AGENTS.md` now defines technical direction, memory rules, and GitHub workflow.
- Architecture docs and a first durable architecture decision are being added.
- GitHub-first development workflow has been adopted: coherent changes should be committed early and pushed once `origin` exists.
- User requested a public GitHub repository and adversarial release review.
- `coursemind` is the selected product-style repository name if still available.
- Five-pass adversarial review added governance, risk, demo, contract, contribution, and CI guardrails.
- User confirmed Next.js as the Web stack direction.
- A typed MVP vertical slice has been added: shared contracts, a mock `services/api` course-agent use case, and Next.js API routes for courses and agent answers.
- The Web app now posts questions to CourseMind's own API boundary and displays citations, review status, and a mock RAG trace.
- A first RAG gateway adapter boundary exists in `services/api/src/rag`; the course-agent use case now depends on `RagGateway` instead of inline retrieval logic.
- Shared contracts now use Zod schemas, and `/api/agent/answer` validates request and response payloads at runtime.
- A Dify RAG adapter skeleton exists in `services/api/src/rag/dify-rag-gateway.ts`; it requires server-side Dify environment variables before real use.
- A RAGFlow adapter skeleton exists in `services/api/src/rag/ragflow-rag-gateway.ts`; it uses the RAGFlow OpenAI-compatible chat completion endpoint and maps returned references into CourseMind citations when configured.
- A model gateway boundary exists in `services/api/src/model`; the MVP defaults to `MockModelGateway`, and an OpenAI-compatible adapter skeleton can support Qwen, DeepSeek, OpenAI-compatible cloud APIs, vLLM, or Ollama through server-side configuration.
- A mock conversation/review persistence boundary exists in `services/api/src/repositories`; answer generation now stores user messages, assistant messages, citations, RAG trace, and pending teacher reviews for the running server process.
- Conversation history API boundaries now exist: `/api/conversations` lists persisted conversation summaries, and `/api/conversations/[conversationId]` returns a full conversation log.
- Teacher review actions now exist for approve, correct, and reject through `/api/teacher/reviews/[reviewId]`.
- A mock audit event boundary now exists in `services/api/src/repositories`; answer generation and teacher review actions record audit events for the running server process.
- `/api/audit/events` exposes the current audit trail, and the Web demo shows recent audit events in the governance panel.
- The Web MVP now defaults to a Chinese school-facing interface while preserving an English version through an in-page language toggle.
- Answer requests carry a `locale` field, defaulting to `zh-CN`, so mock answers, review notes, and guardrails can match the selected UI language.
- A mock course material ingestion boundary now exists through `/api/courses/[courseId]/documents`.
- The Web demo can create a course material ingestion task from the knowledge base panel; new documents update the course snapshot and create a `course_document.ingestion_requested` audit event.
- In-memory mock state is now attached to `globalThis` so Next.js dev/demo API routes share course, review, and audit state more reliably within one running process.
- The Web frontend was simplified from one overloaded dashboard into four separate workspaces: course Q&A, course materials, teacher review, and audit records.
- The Web MVP is now the primary delivery surface. Desktop delivery is deferred as a future shell around the same Web experience.
- The Web UI has adopted the Xiaoyu workbench visual direction: mint green/jade accents, soft glass panels, Chinese-first school workspace tone, and a CourseMind-specific chat/workbench layout.
- The Web UI has now shifted from a cluttered multi-workspace dashboard toward a ChatGPT-like course chat shell: left course/session navigation, a single central conversation flow, a fixed bottom composer, and lightweight right-side governance drawers for materials, teacher review, and audit records.
- Frontend completion status: the main chat surface has been adapted, but the frontend is not yet complete. The route entry is now being separated from the large client component so later work can extract sidebar, conversation, composer, and governance panel components.
- Frontend component extraction has started: `CourseChatSidebar` now owns the left course/session/governance navigation while `CourseChatClient` keeps application state, API calls, conversation, composer, and governance panel orchestration.
- Frontend component extraction continued: `CourseChatConversation` now owns the central empty state, message list, loading state, error line, and bottom composer while `CourseChatClient` keeps course, provider, review, audit, and document-ingestion orchestration.
- The Web sidebar now consumes the persisted conversation history API: `/api/conversations` populates real chat history, and `/api/conversations/[conversationId]` restores a selected conversation into the central chat surface.

## Constraints

- MVP should be fast to demo.
- Architecture should not become a one-off chat page.
- RAG comes before fine-tuning.
- Provider choices must remain replaceable.
- Remote GitHub publishing target is `kipp7/coursemind` with public visibility.
- Avoid large uncommitted or unpushed local work.

## Plan

1. Keep the Next.js MVP usable as the first demo.
2. Establish docs and memory as project-level source of truth.
3. Keep local Git and GitHub remote in sync.
4. Test the Dify adapter against a real Dify app and course knowledge base when credentials are available.
5. Test the RAGFlow adapter against a real RAGFlow chat assistant and course dataset when credentials are available.
6. Add validation to future API routes as they are introduced.
7. Replace the in-memory audit event repository with durable storage when production persistence is introduced.
8. Replace the in-memory persistence repository with Prisma/PostgreSQL when durable storage is needed.
9. Replace the mock document ingestion task with real file upload, parsing, indexing, and provider adapter handoff.
10. Continue polishing Chinese school-facing copy and add formal i18n routing later if the MVP needs shareable language-specific URLs.
11. Continue extracting frontend components once the ChatGPT-like course chat information architecture stabilizes.
12. Keep future work committed and pushed in small coherent units.
13. Evolve the Web MVP toward a Xiaoyu-style school workbench with distinct student Q&A and teacher review/dashboard surfaces.
14. Adapt materials/review/audit panels into production-shaped workflows and continue replacing mock-only UI state with persisted API data.

## Done Criteria

- Web MVP can be opened locally.
- Project has early operating rules in `AGENTS.md`.
- Memory system is connected and has at least one architecture decision.
- GitHub auth and identity are verified.
- Local Git repository is prepared without creating a remote prematurely.
- Initial project state is committed before further substantial development.
- Web MVP exercises a typed API boundary instead of only rendering static mock data.
