# Decision: RAG-First Platform Architecture

## Context

CourseMind is intended to become a school-facing course agent platform. The first deliverable is a Web MVP, but the system must preserve a path toward multiple courses, teacher oversight, audited answers, and provider replacement.

The user clarified that project rules, memory integration, and GitHub workflow should be established early, not added only after the project becomes mature.

## Decision

Use a RAG-first architecture for the MVP and defer fine-tuning until real teacher-approved data exists.

The initial architecture boundaries are:

- Web client for student, teacher, and admin surfaces
- application API for school business rules
- agent orchestration for request flow and policy enforcement
- RAG gateway for Dify/RAGFlow or future retrieval providers
- model gateway for OpenAI-compatible provider switching
- memory and docs for durable architecture decisions

## Rationale

Course materials change often, so RAG is the correct first mechanism for current course knowledge. Fine-tuning is better suited for stable behavior patterns, such as teacher style, scoring rubrics, school policies, and academic-integrity boundaries.

Keeping Dify, RAGFlow, and model APIs behind adapters reduces vendor lock-in and supports future private deployment.

## Consequences

- The first MVP should demonstrate citations and teacher review, not just chat.
- The frontend should not call model providers directly.
- School rules should live in backend configuration and review flows, not only in prompt text.
- Fine-tuning work waits for real usage data and teacher corrections.

## Follow-Up

- Build the Web MVP as the first vertical slice.
- Decide whether the first real RAG provider is Dify or RAGFlow.
- Define shared contracts for course, document, conversation, citation, and review.
- Confirm GitHub repository name, owner, and visibility before remote creation.

