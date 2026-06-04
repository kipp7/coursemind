# Provider Strategy

## Principle

Use open or replaceable platforms early, but keep CourseMind's school-specific rules in our own application layer.

## RAG Providers

CourseMind now has a first code-level RAG gateway boundary in `services/api/src/rag`.

Current behavior:

- `COURSEMIND_RAG_PROVIDER` defaults to `mock`.
- `mock` returns demo citations from course documents without external calls.
- `dify` and `ragflow` are reserved provider IDs, but they intentionally fail until their adapters are implemented and configured.
- The Web app should continue calling CourseMind's own API routes, never provider APIs directly.

### Dify

Best for fast MVP assembly, workflow design, knowledge base demos, and non-engineer configuration.

Use when:

- speed matters more than deep document parsing control
- we want fast demos with workflows
- teachers or operators may configure prompts and flows

### RAGFlow

Best for stronger document parsing, PDF-heavy course materials, and citation-focused retrieval.

Use when:

- course documents are complex
- OCR/table parsing matters
- retrieval quality becomes a visible product risk

## Adapter Contract

Every RAG provider should implement the same application-facing contract:

```text
course id + role + question + visible document metadata
  -> citations
  -> retrieval trace
```

Provider adapters may use different external APIs, but they must return CourseMind citations and traces. Role filtering and school policy must remain in the application layer unless a later ADR explicitly moves part of that responsibility.

## Model Providers

Expose model calls through a model gateway. Keep the app compatible with OpenAI-style chat completion semantics when possible.

Candidate providers:

- OpenAI-compatible APIs for MVP
- Qwen or DeepSeek for Chinese education scenarios
- vLLM for private deployment
- Ollama for local development and demos

## Fine-Tuning

Fine-tuning is not an MVP dependency.

Start considering LoRA or SFT only after collecting:

- teacher-approved answers
- teacher corrections
- assignment feedback examples
- scoring rubrics
- examples of allowed and disallowed help

Fine-tuning should improve style, rubric alignment, and behavior consistency. It should not be used as the main way to store changing course knowledge.

