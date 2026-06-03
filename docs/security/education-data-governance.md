# Education Data Governance

## Purpose

CourseMind must be designed for school use from the first MVP. Real student data, private course content, and teacher review records require stricter handling than a normal demo chatbot.

## Data Classification

### Public

- repository documentation
- sample UI copy
- synthetic course examples
- public architecture decisions

### Internal

- school deployment configuration
- provider routing settings
- non-sensitive usage summaries
- product planning notes

### Restricted

- student questions and learning records
- teacher corrections and grading notes
- uploaded courseware, textbooks, slides, assignments, and exam materials
- model traces containing private context
- API keys, tokens, credentials, and private endpoints

Restricted data must not be committed to this public repository.

## MVP Rules

- Use synthetic sample data only.
- Do not upload real course materials into the repo.
- Do not store student or teacher data in `memory/`.
- Keep local runtime data under ignored directories.
- Treat citations as references to authorized course materials, not permission to publish those materials.

## Product Requirements For Real Deployment

- role-based access control for students, teachers, and admins
- separate visibility for public course material and teacher-only material
- audit logs for document ingestion, answer generation, model calls, and teacher review
- data retention policy for conversations and model traces
- deletion/export path for student records where required by school policy
- explicit approval workflow before course documents become answerable

## Academic Integrity

The agent should support learning, not replace student work.

Required behavior:

- explain concepts
- provide hints and guided steps
- review student drafts
- refuse to complete graded work directly when policy requires
- cite course materials where possible

