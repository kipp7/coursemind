---
title: web-first-xiaoyu-workbench-visual-direction
type: note
tags:
  - decision
status: active
---

# Decision: Web First With Xiaoyu Workbench Visual Direction

## Context

CourseMind needs a school-facing MVP that can be promoted and reviewed quickly. A previous project under `04_aI-conversation` provides a working Electron desktop shell and a mature Xiaoyu-style school workbench UI with mint green glass panels, teacher dashboard density, session navigation, and desktop evidence scripts.

The user decided CourseMind should start with Web delivery, while reusing the Xiaoyu visual language for the Web MVP.

## Decision

CourseMind will prioritize the Web MVP as the main delivery surface. Desktop delivery is deferred and should later wrap the same Web experience through Electron or a similar desktop shell.

The current Web UI should adopt the Xiaoyu workbench color system and product tone: mint green, jade/teal accents, soft glass panels, school workbench density, and Chinese-primary copy.

## Rationale

Web is easier for school rollout because it can be shared by URL, updated centrally, and used across student, teacher, and admin roles without local installation. The desktop path remains valuable for demos, office computers, and future local deployment, but it should not split the product into two separate frontends.

The Xiaoyu visual system already feels closer to a school product than a generic chatbot layout, so it is the preferred design reference for CourseMind.

## Consequences

- Web remains the primary implementation target under `apps/web`.
- CourseMind can later add an Electron desktop shell that loads the same Web route.
- The current UI should keep the existing API boundaries and MVP vertical slice while adopting Xiaoyu-style visuals.
- `04_aI-conversation/` is treated as a local reference project and must not be committed into the CourseMind repository.

## Follow-up

- Continue extracting CourseMind-specific workspace panels from the Xiaoyu workbench pattern.
- Add a teacher-facing dashboard view once the student Q&A flow is visually stable.
- Revisit desktop packaging only after the Web MVP is coherent enough to wrap.
