# ADR 0005: Typed API Vertical Slice

## Status

Accepted

## Context

CourseMind needs a Web MVP that demonstrates the real school-facing flow without coupling the frontend to a model provider or a RAG vendor. The previous demo showed the intended experience, but it did not yet exercise the application API boundary.

## Decision

Introduce three lightweight layers for the MVP vertical slice:

- `libs/contracts` for shared DTOs used by Web, API, RAG, and model boundaries.
- `services/api` for course-agent business use cases and provider-facing adapter seams.
- Next.js route handlers under `apps/web/src/app/api` for the Web delivery surface.

The first implementation uses mock course snapshots and mock retrieval data. It returns cited answers, a RAG trace, guardrails, and a pending teacher review object.

The mock retrieval path has since been moved behind `services/api/src/rag`. The use case now depends on a `RagGateway` interface rather than inline retrieval logic.

## Rationale

This keeps the MVP fast while preserving the future architecture. The Web app now calls CourseMind's own API first, and the API owns school business rules such as role visibility, citation requirements, and teacher review state.

Mock retrieval is acceptable at this stage because the goal is to prove the contract and control boundary before choosing Dify, RAGFlow, or a custom provider.

## Consequences

- Frontend code consumes typed response shapes instead of provider-specific API responses.
- Dify or RAGFlow can be added later behind the same API use case.
- The MVP can demo the full answer path without real course data or secrets.
- Persistence, authentication, and real provider adapters are still deferred.
- `COURSEMIND_RAG_PROVIDER` currently defaults to `mock`; non-mock provider IDs are reserved until configured adapters exist.

## Follow-Up

- Implement Dify and RAGFlow adapters behind the existing RAG gateway interface.
- Add persistence for conversation messages and teacher reviews.
- Localize Web demo copy for the intended Chinese school audience.
