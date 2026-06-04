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
4. Implement Dify and RAGFlow adapters behind the existing RAG gateway interface.
5. Decide whether to add Zod for runtime validation at API boundaries.
6. Persist conversation messages and teacher review records.
7. Localize the Web demo copy for the intended Chinese school audience.
8. Keep future work committed and pushed in small coherent units.

## Done Criteria

- Web MVP can be opened locally.
- Project has early operating rules in `AGENTS.md`.
- Memory system is connected and has at least one architecture decision.
- GitHub auth and identity are verified.
- Local Git repository is prepared without creating a remote prematurely.
- Initial project state is committed before further substantial development.
- Web MVP exercises a typed API boundary instead of only rendering static mock data.
