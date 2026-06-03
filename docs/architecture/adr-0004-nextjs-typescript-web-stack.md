# ADR-0004: Next.js TypeScript Web Stack

## Status

Accepted

## Context

CourseMind needs a Web-first MVP that can later become a school-facing platform with student, teacher, and admin surfaces. The user confirmed that the frontend should use Next.js rather than Vue/Nuxt.

The stack should support:

- product-quality Web UI
- typed contracts shared with backend services later
- AI chat and streaming UX later
- GitHub-first development and CI
- future separation between frontend, API, RAG gateway, and model gateway

## Decision

Use this initial Web stack:

- monorepo package manager: pnpm workspaces
- frontend app: Next.js App Router
- language: TypeScript
- styling: Tailwind CSS
- icons: lucide-react
- lint/build gate: Next.js ESLint and TypeScript checks

Keep these as planned/candidate tools rather than immediate dependencies:

- shadcn/ui for production UI primitives once component reuse grows
- Vercel AI SDK for streaming chat and model-provider UI integration
- Zod for runtime validation and shared contracts
- Prisma + PostgreSQL for platform storage
- NestJS for the application API
- Dify or RAGFlow behind a RAG gateway adapter
- Playwright for browser regression tests once the UI is interactive enough
- Turborepo if workspace build orchestration becomes necessary

## Rationale

Next.js and TypeScript fit the product direction better than a pure static prototype. Keeping the backend as a separate service boundary avoids placing school business rules inside frontend routes only. pnpm workspaces keep the project ready for `apps/`, `services/`, and `libs/` without imposing a heavy monorepo tool on day one.

## Consequences

- The existing static prototype has been migrated into `apps/web`.
- CI should run the web app lint/build checks.
- Future API and RAG code should not be hidden inside UI components.
- Tool additions should be justified by product or architecture need, not trend.

## Follow-Up

- Keep `apps/web` green under `pnpm check`.
- Record backend stack decisions separately before adding `services/api`.
