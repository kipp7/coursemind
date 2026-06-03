# Workspace Setup

This workspace is configured for Codex with:

- Basic Memory for durable notes and cross-session recall.
- CTX for generated repository context and MCP-based context access.
- Reusable workflows in `WORKFLOWS.md`.
- Team governance rules in `memory/TEAM_RULES.md`.

## Directory conventions

- `memory/` stores durable notes, decisions, and task history.
- `memory/_templates/` stores reusable note templates for Codex and manual use.
- `.context/` stores generated context artifacts from CTX.
- `.bm-state/` stores isolated Basic Memory runtime state for this workspace.

## Usage rules

- Store architecture decisions and non-trivial task outcomes under `memory/`.
- Prefer updating an existing note instead of creating duplicate notes.
- Start new notes from the templates in `memory/_templates/`.
- Use the prompts in `WORKFLOWS.md` when you want a fast, repeatable command pattern.
- Follow the shared editing and review conventions in `memory/TEAM_RULES.md`.
- Keep generated artifacts inside `.context/`; do not hand-edit them.
- Keep secrets out of `memory/` and `context.yaml`.
- Use `.tools/basic-memory/basic-memory.cmd` for manual CLI/admin commands in this workspace.
- Codex uses `.tools/basic-memory/basic-memory-mcp.cmd` for the long-running MCP server.

## Project-Specific Entry Points

- `AGENTS.md`
  - project-local operating rules for CourseMind
  - technical direction, memory policy, and GitHub remote workflow
- `docs/architecture/technical-architecture.md`
  - current source of truth for the course-agent technical architecture
- `docs/product/mvp-scope.md`
  - first MVP boundary and non-goals
- `docs/integrations/provider-strategy.md`
  - Dify, RAGFlow, model gateway, and future fine-tuning integration notes
- `memory/decisions/0001-rag-first-platform-architecture.md`
  - durable architecture decision for RAG-first delivery
- `memory/tasks/mvp-web-course-agent.md`
  - current tracked MVP task and done criteria

## CourseMind Memory Conventions

- Record technical architecture choices in both `docs/architecture/` and `memory/decisions/` when they become stable.
- Keep product scope in `docs/product/` and active execution state in `memory/tasks/`.
- Use `memory/checkpoints/` before long pauses, branch switches, or remote publication.
- Do not store student private data, uploaded teaching materials, API keys, or school credentials in `memory/`.
