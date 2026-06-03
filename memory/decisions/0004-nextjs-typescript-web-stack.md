# Decision: Next.js TypeScript Web Stack

## Context

The user asked whether Vue should be considered and then confirmed Next.js. CourseMind needs a Web MVP that can grow into a school-facing AI course platform.

## Decision

Use Next.js App Router, TypeScript, Tailwind CSS, lucide-react, and pnpm workspaces for the initial Web app.

Keep shadcn/ui, Vercel AI SDK, Zod, Prisma/PostgreSQL, NestJS, Dify/RAGFlow, Playwright, and Turborepo as planned or candidate tools until the project reaches the point where each is needed.

## Rationale

Next.js gives a strong React ecosystem for AI product UI and platform pages. TypeScript supports shared contracts across frontend/backend boundaries. pnpm workspaces provide room for `apps/`, `services/`, and `libs/` without forcing heavy orchestration immediately.

## Consequences

- The static MVP has moved into `apps/web`.
- CI should run Next.js lint/typecheck/build checks.
- Backend, RAG, and model provider work should remain behind separate boundaries.

## Follow-Up

- Keep the Next.js app green under `pnpm check`.
- Watch GitHub Actions after pushing the migration.
- Commit and push the stack migration as a coherent unit.
