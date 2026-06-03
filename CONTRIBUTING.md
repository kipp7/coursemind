# Contributing

CourseMind is GitHub-first. Keep changes small, reviewable, and pushed after each useful commit.

## Before You Start

Read:

- `AGENTS.md`
- `WORKSPACE.md`
- `docs/architecture/technical-architecture.md`
- relevant notes in `memory/decisions/` and `memory/tasks/`

## Commit Rules

- Commit coherent units of work.
- Push after each useful commit once the remote is configured.
- Keep generated runtime state out of Git.
- Update docs or memory when a technical decision changes.

## Public Repository Rules

Do not commit:

- API keys, tokens, credentials, or private endpoints
- student records or learning analytics
- private course documents
- teacher review data from real deployments
- copyrighted teaching materials without publication rights

## Quality Checks

Before pushing substantial work:

```powershell
pnpm check
```

If you have the local GitHub publish-check helper installed, run it in public-release mode as well. GitHub Actions also runs repository hygiene checks on push and pull requests.
