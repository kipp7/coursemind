# CourseMind MVP Scope

## Purpose

The MVP should convince school stakeholders that CourseMind is not a generic chatbot. It is a course-aware teaching assistant with citations, teacher oversight, and a path toward school deployment.

## In Scope

- Web delivery surface
- One or more sample course spaces
- Student question-answering experience
- Teacher configuration surface
- Knowledge base status and citation display
- Provider strategy that can connect to Dify or RAGFlow later
- Clear explanation of RAG-first and fine-tuning-later strategy

## Out Of Scope For First MVP

- full school SSO
- real production permissions
- full document ingestion pipeline
- automatic grading
- fine-tuning
- private model deployment
- multi-tenant SaaS billing

## Demo Story

1. A student enters a course.
2. The student asks for help understanding a topic.
3. The agent answers using course materials.
4. The answer shows citations.
5. A teacher sees where course knowledge and review rules fit.
6. An admin sees the future architecture path.

## MVP Success Criteria

- A non-technical teacher understands what problem it solves.
- A technical reviewer sees where Dify/RAGFlow/model APIs connect.
- The product shows citation and review thinking from the first version.
- The architecture does not force us into one provider or one model.

