# Tooling Candidates

CourseMind should add tools when they unlock a concrete product or engineering need. Avoid installing every popular AI/web library before the MVP requires it.

## Current Tooling

- Next.js App Router: Web application framework
- TypeScript: application typing and future shared contracts
- Tailwind CSS: styling system
- lucide-react: icon set
- pnpm workspaces: lightweight monorepo foundation
- GitHub Actions: repository hygiene and web checks

## Candidate Tools

| Tool | When To Add | Why |
| --- | --- | --- |
| shadcn/ui | When repeated UI primitives appear | Accessible component source code that fits Tailwind and React |
| Vercel AI SDK | When real streaming chat or model calls start | TypeScript-first AI UI and provider integration |
| Zod | When API contracts need runtime validation | Shared schema validation for DTOs |
| Prisma | When PostgreSQL schema is introduced | Typed data access for platform entities |
| NestJS | When `services/api` begins | Structured TypeScript backend for school business logic |
| Auth.js | When authentication starts | Next.js-friendly authentication foundation |
| Playwright | When UI flows need regression coverage | Browser-level checks for demo and product flows |
| Turborepo | When workspace builds become slow or multi-package | Task orchestration and cache for monorepos |
| Dify SDK/API | When the first RAG provider is wired | Fast workflow and knowledge base integration |
| RAGFlow API | When complex documents become a risk | Stronger document understanding and RAG ingestion path |

## Decision Rule

Before adding a new dependency:

1. Write the concrete use case.
2. Confirm it does not collapse API/RAG/model boundaries into UI code.
3. Add a small integration surface.
4. Update ADR or memory if the choice affects architecture.
