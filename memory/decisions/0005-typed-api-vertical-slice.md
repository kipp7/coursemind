---
title: typed-api-vertical-slice
type: note
tags:
  - decision
  - architecture
status: active
---

# Decision: Typed API Vertical Slice

## Context

The CourseMind MVP needed to move beyond a static Web mock while still avoiding premature provider lock-in, real secrets, or private course data.

## Decision

Add `libs/contracts` for shared DTOs, `services/api` for the course-agent use case, and Next.js API routes for `/api/courses` and `/api/agent/answer`.

The first API implementation uses mock course snapshots and mock RAG evidence, but returns the same concepts the real system needs: citations, RAG trace, guardrails, and teacher review state.

## Rationale

The frontend should call our own application API, not Dify, RAGFlow, or model providers directly. This preserves role rules, course permissions, auditability, and provider replacement as core platform concerns.

## Consequences

- The Web MVP now exercises the intended API boundary.
- Real RAG providers can be added behind the API use case later.
- Persistence and auth are still deferred.
- UI copy is currently conservative ASCII/English to avoid local encoding churn; Chinese demo localization remains a follow-up.

## Follow-up

- Add provider adapter interfaces for Dify and RAGFlow.
- Persist conversation and review records.
- Localize demo copy for school-facing presentation.
