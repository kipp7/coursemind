---
title: model-gateway-boundary
type: note
tags:
  - decision
status: active
---

# Decision: Model Gateway Boundary

## Context

CourseMind needs to support replaceable model providers without letting the Web client or course-agent use case depend on provider-specific APIs. The project direction includes OpenAI-compatible cloud APIs, Qwen, DeepSeek, vLLM private deployment, and Ollama local development.

## Decision

Add a `ModelGateway` boundary under `services/api/src/model`.

The MVP defaults to `MockModelGateway` for deterministic demos. Real provider integration should go through `OpenAiCompatibleModelGateway` first, selected by `COURSEMIND_MODEL_PROVIDER=openai-compatible` and server-side runtime configuration.

## Rationale

This keeps model credentials and provider details on the server side, aligns model integration with the existing RAG gateway pattern, and lets answer responses carry `modelTrace` alongside `ragTrace`.

## Consequences

- `answerCourseQuestion` now calls a model gateway instead of composing the assistant answer inline.
- Conversation logs, teacher review queue items, and answer responses include `modelTrace`.
- OpenAI-compatible APIs can support Qwen, DeepSeek, OpenAI-compatible cloud gateways, vLLM, or Ollama without changing frontend code.
- Real model behavior still needs environment-specific testing before production use.

## Follow-up

- Test `OpenAiCompatibleModelGateway` against a real local or cloud model endpoint.
- Add cost and latency tracking when token usage becomes reliable.
