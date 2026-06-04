---
title: desktop-resume-2026-06-04
type: note
tags:
- checkpoint
- resume
status: active
permalink: 21-agent/memory/checkpoints/2026-06-04-desktop-resume
---

# Checkpoint: Desktop Resume 2026-06-04

## Completed Work

- Repository: `kipp7/coursemind`, public GitHub remote at `https://github.com/kipp7/coursemind`.
- Latest pushed commit before this checkpoint was originally `53e8926 feat: add typed api vertical slice`; later work added `e617320 docs: add desktop resume checkpoint`.
- GitHub Actions `quality-gates` passed for that commit.
- CourseMind is a school-facing course agent platform, not a disposable chatbot demo.
- The MVP technical direction is Next.js App Router Web first, RAG first, fine-tuning later.
- The Web MVP lives in `apps/web`.
- Shared DTO contracts were added in `libs/contracts`.
- A lightweight application API boundary was added in `services/api`.
- Next.js API routes were added for `/api/courses` and `/api/agent/answer`.
- The Web UI now calls CourseMind's own API and displays citations, mock RAG trace, guardrails, and teacher review state.
- A first RAG gateway code boundary now exists in `services/api/src/rag`, with `mock` as the default provider.
- Shared contracts now use Zod schemas, and the answer API validates request and response payloads at runtime.
- A Dify adapter skeleton now exists; real Dify use requires server-side `COURSEMIND_DIFY_API_BASE_URL` and `COURSEMIND_DIFY_APP_AUTH`.
- A mock persistence boundary now records conversation messages, citations, RAG traces, and pending teacher review items for the running server process.
- Teacher review actions now support approve, correct, and reject in the mock persistence boundary.
- Memory decisions currently recorded:
  - `memory/decisions/0001-rag-first-platform-architecture.md`
  - `memory/decisions/0002-github-first-development-workflow.md`
  - `memory/decisions/0003-public-mvp-governance-gates.md`
  - `memory/decisions/0004-nextjs-typescript-web-stack.md`
  - `memory/decisions/0005-typed-api-vertical-slice.md`
- Active task state is in `memory/tasks/mvp-web-course-agent.md`.

## Current State

- Local and remote `main` were aligned at `53e8926` before this checkpoint was added.
- `pnpm check` passed locally after the typed API vertical slice.
- Production API smoke test passed locally:
  - `/api/courses` returned `200`.
  - `/api/agent/answer` returned `200`.
  - response `ragTrace.provider` was `mock`.
- Runtime state such as `.bm-state/`, `.context/`, logs, databases, and build caches is ignored by Git.
- Durable project memory under `memory/` is tracked and pushed to GitHub when committed.

## Next Steps

- Test the Dify adapter against a real Dify app and course knowledge base when credentials are available.
- Implement the RAGFlow adapter behind the existing RAG gateway interface.
- Extend runtime validation to future API routes.
- Add durable audit event semantics when replacing the in-memory repository.
- Replace in-memory persistence with a durable database repository when the MVP needs retained history across restarts.
- Persist conversation messages and teacher review records after the mock flow is stable.
- Localize the demo UI copy for a Chinese school-facing presentation.
- Keep the GitHub-first cadence: run `pnpm check`, commit coherent changes, push, and verify Actions.

## Risks And Notes

- Do not commit real student data, uploaded course materials, private school endpoints, API keys, or teacher review records.
- Do not let the frontend call model or RAG providers directly.
- Basic Memory local runtime state is not meant to be pushed; markdown memory notes are the portable source of truth.

## Resume Prompt

Read `AGENTS.md`, `WORKSPACE.md`, `WORKFLOWS.md`, `docs/architecture/technical-architecture.md`, `memory/tasks/mvp-web-course-agent.md`, and this checkpoint. Then continue CourseMind by adding the RAG provider adapter interface and keeping the public GitHub repo synchronized.
