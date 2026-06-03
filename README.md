# CourseMind

CourseMind is a school-facing course agent platform MVP for course-aware Q&A, cited answers, teacher oversight, and RAG-first delivery.

The project starts with a Web demo, but its architecture is intended for a future platform with course spaces, role permissions, auditable retrieval, replaceable model providers, and optional private deployment.

## Why It Exists

Schools do not only need a chatbot. They need an assistant that can answer from approved course materials, show where the answer came from, respect teaching rules, and give teachers a way to review and improve the system over time.

## Current Status

This repository is in the first MVP stage.

Implemented now:

- static Web prototype
- student, teacher, and admin surfaces
- course switching
- cited answer experience
- knowledge base status mock
- RAG-first architecture documents
- project memory and operating rules

Not implemented yet:

- production backend
- real document ingestion
- real Dify or RAGFlow integration
- authentication and course permissions
- teacher review persistence
- fine-tuning

## Run The MVP

Open the static prototype in a browser:

```text
index.html
```

No build step is required for the current prototype.

## Architecture

The intended technical shape is:

```text
Web Client
  -> Application API
  -> Agent Orchestration
  -> RAG Gateway
  -> Model Gateway
  -> Storage and Governance
```

Key documents:

- `AGENTS.md`
- `docs/architecture/technical-architecture.md`
- `docs/architecture/risk-register.md`
- `docs/product/mvp-scope.md`
- `docs/product/demo-script.md`
- `docs/integrations/provider-strategy.md`
- `docs/integrations/contracts.md`
- `docs/security/education-data-governance.md`
- `memory/decisions/0001-rag-first-platform-architecture.md`
- `memory/decisions/0002-github-first-development-workflow.md`
- `memory/decisions/0003-public-mvp-governance-gates.md`

## RAG Before Fine-Tuning

The MVP prioritizes RAG because course materials change frequently. Fine-tuning should come later, after real teacher-approved answers, corrections, rubrics, and review data exist.

RAG teaches the system current course content. Fine-tuning later teaches stable behavior: teacher style, school policies, scoring standards, and academic-integrity boundaries.

## Public Repository Policy

This repository should not contain real student data, private school documents, API keys, internal endpoints, or copyrighted teaching materials without explicit publication rights. See `SECURITY.md`.

## Contributing

See `CONTRIBUTING.md`. This project uses small commits, frequent pushes, and GitHub Actions hygiene checks.

## Project Memory

This workspace is connected to project-local memory through:

- `WORKSPACE.md`
- `WORKFLOWS.md`
- `memory/`
- `.tools/basic-memory/`

Generated runtime state is intentionally ignored by Git.

## License

MIT
