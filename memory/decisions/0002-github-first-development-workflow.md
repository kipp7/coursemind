# Decision: GitHub-First Development Workflow

## Context

The user clarified that this project should be developed and maintained primarily through GitHub pushes. Large piles of local-only files or unsynchronized work should be avoided from the beginning.

## Decision

Use a GitHub-first workflow:

- commit coherent changes early
- push after each useful commit once a remote exists
- treat GitHub as the main collaboration and backup surface
- keep project rules, architecture docs, memory notes, and source files committed
- keep runtime state, local databases, logs, and secrets ignored

Remote creation still requires explicit confirmation of repository name, owner, and visibility.

## Rationale

CourseMind is expected to become a real project, not just a disposable MVP. Early GitHub discipline keeps architecture decisions, memory notes, and implementation history reviewable and recoverable.

## Consequences

- The project should not accumulate large uncommitted changes.
- Every substantial task should end with a local commit, and later with a push.
- If `origin` is missing, the next operational priority is to create or connect the GitHub remote.
- New contributors and future agents should inspect Git state before changing code.

## Follow-Up

- Use public repository visibility per user direction.
- Use `coursemind` as the durable, product-style repository name if still available.
- Create remote under `kipp7`.
- Push the initial commit after public-release hygiene is complete.
