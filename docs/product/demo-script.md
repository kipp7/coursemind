# MVP Demo Script

## Audience

- school administrators
- teachers
- technical reviewers
- potential student testers

## Demo Goal

Show that CourseMind is a course-aware teaching assistant, not a generic chatbot.

## Flow

1. Run `pnpm dev`.
2. Open `http://localhost:3000`.
3. Point out the three roles: student, teacher, admin.
4. Select a course.
5. Ask a student-style question.
6. Show that the answer includes cited course sources.
7. Switch to teacher mode and explain teacher configuration/review.
8. Point to the knowledge base status area.
9. Explain the architecture path: Web client, API, RAG gateway, model gateway, storage/governance.

## Talk Track

CourseMind starts with RAG because course materials change often. The agent should retrieve approved course content, generate an answer, and show citations. Fine-tuning comes later, after teachers have approved enough answers, corrections, rubrics, and behavior examples.

## Acceptance Criteria

- A teacher understands how course materials influence answers.
- A reviewer sees that answers should be cited and auditable.
- The MVP does not imply real student data or real course documents are already stored.
- The future integration path for Dify/RAGFlow/model APIs is clear.

## Known Limitations

- Current prototype is a Next.js MVP with mocked data.
- Citations and knowledge base status are mocked.
- No backend API exists yet.
- No authentication or real role permissions exist yet.
- No real RAG provider is connected yet.
