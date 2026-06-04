---
title: chatgpt-like-course-chat-layout
type: note
tags:
  - decision
status: active
---

# Decision: ChatGPT-Like Course Chat Layout

## Context

The previous CourseMind Web MVP had the right school governance features, but the frontend felt cluttered because course Q&A, materials, teacher review, audit events, and architecture details were all visible as competing workspace surfaces.

The user asked whether CourseMind could directly use a ChatGPT-style open-source layout. Two useful references are `vercel/ai-chatbot` and `mckaywrigley/chatbot-ui`.

## Decision

CourseMind will adopt the ChatGPT-like information architecture for the MVP Web surface:

- left sidebar for course spaces, session shortcuts, role, and language controls
- central screen dedicated to the conversation
- fixed bottom composer
- materials, teacher review, and audit records exposed through lightweight governance drawers
- Xiaoyu mint/jade visual direction retained, but used more quietly

The project should not copy an open-source app wholesale at this stage. It should adapt the proven chat product layout while keeping CourseMind's own API, RAG, citation, review, and audit boundaries.

## Rationale

This makes the MVP easier to understand in a school demo: the first thing users see is the course conversation, not a management dashboard. It also preserves a clean growth path because governance features remain present without overwhelming the student question flow.

Adapting the layout instead of importing a full template avoids fighting another project's auth, persistence, provider, and styling assumptions.

## Consequences

- The Web MVP now feels closer to a real chat product.
- Teacher and admin workflows are still available, but no longer dominate the first screen.
- Future extraction should split the current page into sidebar, conversation, composer, and governance drawer components.
- A future production pass can still borrow component ideas from open-source chat templates, especially streaming message UI and persisted chat history.

## Follow-up

- Extract the large `apps/web/src/app/page.tsx` file into focused components after one more round of UX stabilization.
- Add real persisted conversations before replacing the mock session list.
- Revisit Vercel AI SDK or assistant-ui only after CourseMind's backend provider boundary is stable.
