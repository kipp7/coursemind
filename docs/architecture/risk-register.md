# Risk Register

| Risk | Impact | Mitigation | MVP Status |
| --- | --- | --- | --- |
| Hallucinated answers | Students may learn incorrect material | Require citations, retrieval traces, and teacher review | Partially addressed in UI/docs |
| Permission leakage | Students may see teacher-only material | Backend role checks and document visibility scopes | Not implemented |
| Private data exposure | Public repo or logs may leak student/course data | Governance policy, `.gitignore`, secret scanning, CI checks | Policy and CI added |
| Vendor lock-in | Dify/RAGFlow/model vendor becomes hard to replace | RAG gateway and model gateway adapter boundaries | Dify skeleton added, RAGFlow pending |
| Academic integrity failures | Agent may complete graded work directly | Teaching policy layer and refusal rules | Documented, not implemented |
| Weak document parsing | Poor citations or missed course context | Evaluate Dify vs RAGFlow with real course samples | Dify skeleton added, real samples pending |
| Cost growth | Model usage may become expensive | Usage logs, caching, model tiering, rate limits | Not implemented |
| Teacher trust gap | Teachers may reject unreviewed answers | Teacher correction/review workflow | Mock review queue and actions added |
| Public repo hygiene drift | Later commits may add secrets or private files | GitHub Actions quality gates and GitHub-first workflow | Added |

## Review Cadence

Update this register whenever:

- a provider is selected
- real course materials are introduced
- backend storage is added
- authentication or permissions are implemented
- a new risk appears during school review

