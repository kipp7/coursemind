# Task: MVP Web Course Agent

## Goal

Build a Web MVP for CourseMind that demonstrates a school-ready course agent experience and preserves the future platform architecture.

## Current State

- Static Web prototype exists at the project root.
- Workspace memory and context scaffold has been installed.
- Project-specific `AGENTS.md` now defines technical direction, memory rules, and GitHub workflow.
- Architecture docs and a first durable architecture decision are being added.
- GitHub-first development workflow has been adopted: coherent changes should be committed early and pushed once `origin` exists.

## Constraints

- MVP should be fast to demo.
- Architecture should not become a one-off chat page.
- RAG comes before fine-tuning.
- Provider choices must remain replaceable.
- Remote GitHub publishing requires user confirmation for repo name, owner, and visibility.
- Avoid large uncommitted or unpushed local work.

## Plan

1. Keep the static MVP usable as the first demo.
2. Establish docs and memory as project-level source of truth.
3. Initialize local Git and prepare for GitHub publication.
4. Later, migrate the static MVP into a production frontend stack.
5. Later, connect an API layer and a RAG provider.
6. After remote confirmation, create the GitHub repository and push the initial commit.

## Done Criteria

- Web MVP can be opened locally.
- Project has early operating rules in `AGENTS.md`.
- Memory system is connected and has at least one architecture decision.
- GitHub auth and identity are verified.
- Local Git repository is prepared without creating a remote prematurely.
- Initial project state is committed before further substantial development.
