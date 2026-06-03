# Decision: Public MVP Governance Gates

## Context

The user requested five adversarial reviews after the public GitHub push. The review found that the repository was publishable, but it needed stronger public-project guardrails before real MVP development continues.

## Decision

Add lightweight governance and quality gates now:

- contribution rules
- education data governance policy
- architecture risk register
- demo script and acceptance criteria
- initial cross-layer contracts
- GitHub Actions repository hygiene workflow

## Rationale

CourseMind is public and school-facing. Even in MVP stage, the repository needs clear rules that prevent real student data, private course materials, or provider secrets from being committed. CI should catch obvious public-release hygiene issues before the project grows.

## Consequences

- Future work must keep docs and memory aligned when scope or architecture changes.
- Pushes to `main` and pull requests run basic hygiene checks.
- Real deployment work must respect the data classification in `docs/security/education-data-governance.md`.

## Follow-Up

- Convert the static prototype into an app workspace.
- Add typed contracts when the frontend/backend stack is chosen.
- Expand CI once package tooling exists.
