# AGENTS

## Project Identity

CourseMind is a school-facing course agent platform. The current target is a Web MVP that proves one vertical slice:

```text
student question -> course context -> RAG retrieval -> model answer -> cited response -> teacher review data
```

Do not treat the MVP as a disposable chat demo. Every implementation choice should preserve a path toward multi-course, multi-role, auditable school deployment.

## Active Technical Direction

- Delivery surface: Web first.
- MVP frontend: static prototype now; React / Next.js is the expected production frontend.
- Backend boundary: keep school business logic in our own API layer.
- AI platform: prefer RAG first, with Dify or RAGFlow as replaceable adapters.
- Model access: use OpenAI-compatible model gateway semantics so Qwen, DeepSeek, OpenAI, vLLM, or Ollama can be swapped.
- Fine-tuning: defer until real teacher-approved answers, rubrics, and review data exist.
- Governance: every answer path should be designed for citations, role permissions, audit logs, and teacher review.

## Required Startup Context

Before non-trivial work, read:

1. `AGENTS.md`
2. `WORKSPACE.md`
3. `WORKFLOWS.md`
4. `docs/architecture/technical-architecture.md`
5. relevant notes under `memory/decisions/` and `memory/tasks/`

For small UI copy or style edits, read only the files directly involved plus this file.

## Memory Rules

This project uses `memory/` as a durable project knowledge layer.

Record or update memory when:

- a technical architecture choice is made
- a product scope boundary changes
- a provider is chosen or replaced
- a meaningful implementation checkpoint is reached
- a risk, constraint, or school deployment assumption becomes stable

Use:

- `memory/decisions/` for decisions and tradeoffs
- `memory/tasks/` for current work
- `memory/checkpoints/` for resumable state
- `memory/references/` for stable commands and integration notes

Never store secrets, student private data, API keys, or credentials in memory.

## Git And Remote Rules

The machine is configured for GitHub account `kipp7` over HTTPS.

This project should be maintained GitHub-first. Do not let large uncommitted or unpushed work accumulate.

Before creating or pushing a remote:

1. check `gh auth status`
2. check Git identity
3. inspect `git status --short`
4. confirm repository name, owner, and public/private visibility with the user

Default remote creation should be private unless the user explicitly asks for public.

Working cadence:

- Commit coherent changes as soon as a meaningful unit is complete.
- Push after each useful commit once `origin` exists.
- Before starting a new task, inspect `git status --short` and `git log --oneline -5`.
- Do not leave generated files, design experiments, or temporary notes unstaged for long.
- Keep runtime state ignored; keep rules, docs, memory notes, and source files committed.
- If remote push fails, fix the remote/auth issue before continuing substantial implementation work.

## Architecture Rules

- Keep RAG provider integration behind an adapter boundary.
- Keep model provider integration behind a model gateway boundary.
- Keep role, course, document, conversation, citation, and review DTOs shared through contracts.
- Do not let frontend code call model providers directly.
- Do not put school policy, permissions, or audit decisions inside prompt text only; represent them in backend rules or persisted configuration.
- Prefer a single vertical slice before broad platform expansion.
- Update `docs/architecture/risk-register.md` when a new deployment, privacy, provider, or academic-integrity risk appears.
- Follow `docs/security/education-data-governance.md` before introducing real data or course materials.

## MVP Done Criteria

The first serious MVP should demonstrate:

- student and teacher role surfaces
- at least one course space
- course document ingestion path, even if mocked first
- RAG answer flow
- citation display
- teacher review or correction path
- conversation logging boundary
- clear provider swap story for Dify / RAGFlow / model API
