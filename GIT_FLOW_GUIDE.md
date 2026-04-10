# Git Flow + Commit Message Style Guide

## Branches (Git-flow model)

This repo follows the classic Git-flow idea: keep stable production history separate from ongoing integration work.

- `main` (sometimes called `master`): production/stable branch
- `develop`: integration branch for features (what will become the next release)
- `feature/*`: new features or meaningful improvements
- `release/*`: preparing a new release (finalizing, fixing, and bumping versions)
- `hotfix/*`: urgent fixes to production that need to ship immediately

### Naming conventions

- `feature/<short-name>` (example: `feature/add-checkout`)
- `release/<version>` (example: `release/1.4.0`)
- `hotfix/<version>` (example: `hotfix/1.4.1`)

### Typical rules

- Start `feature/*` branches from `develop`.
- Merge `feature/*` branches back into `develop` after review and tests.
- Start `release/*` branches from `develop`.
- Merge `release/*` into both `main` and `develop` once the release is ready.
- Start `hotfix/*` branches from `main`.
- Merge `hotfix/*` into both `main` and `develop` once the production fix is ready.

## Hotfix workflow (how to use it)

Use `hotfix/*` when there is a production issue and you need a quick patch.

1. Create a branch from `main`:
  - `hotfix/<next-patch-version>`
2. Make the minimal fix needed to resolve the issue.
3. Update versioning (see next section).
4. Merge back:
  - merge into `main` (so production gets the fix)
  - merge into `develop` (so the fix is not lost later)
5. Tag the release in `main` (if your workflow uses tags).
6. Delete the `hotfix/*` branch after merges succeed.

## Versioning (SemVer)

This guide assumes **Semantic Versioning (SemVer)**:

- `MAJOR`: breaking changes
- `MINOR`: new functionality (backwards-compatible)
- `PATCH`: bug fixes (backwards-compatible)

### When to bump which number

- On `release/*`: bump for the planned release (often `MINOR` or sometimes `MAJOR`).
- On `hotfix/*`: almost always bump `PATCH`.

### Practical approach

- Update the version in `package.json` (and any other version files you use).
- Keep the version bump tied to the `release/*` or `hotfix/*` branch.
- Prefer one clear version bump commit right before merging the release/hotfix.

## Commit message style (Conventional Commits)

Even though Git-flow is about branching, commit message consistency is what makes the history readable.

### Format

Use:

`<type>(<scope>): <subject>`

Where:

- `<type>` is one of the allowed types below
- `<scope>` is optional but recommended (examples: `auth`, `products`, `shop`, `pagination`, `views`, `db`, `utils`)
- `<subject>` is a short description in imperative mood (for example: "add", "fix", "remove")

Examples:

- `feat(auth): add reset password endpoint`
- `fix(shop): prevent cart total from becoming negative`
- `chore: remove unused legacy db utility`

### Subject rules

- Keep it short (roughly under 72 characters when possible)
- No trailing period
- Use imperative mood: `add`, `fix`, `remove`, `update`

## Allowed commit types (with examples)

- `feat:` new user-facing feature
  - `feat(pagination): add page navigation controls`
- `fix:` bug fix
  - `fix(auth): handle missing csrf token`
- `refactor:` restructuring with no behavior change
  - `refactor(db): simplify Mongo connection helper`
- `perf:` performance improvements
  - `perf(shop): reduce redundant product queries`
- `chore:` maintenance/cleanup (tooling, refactors, deletions)
  - `chore: update .gitignore for env files`
  - `chore: remove unused files`
- `docs:` documentation-only changes
  - `docs: update README setup steps`
- `test:` adding/updating tests
  - `test: cover order pagination edge cases`
- `build:` build system changes
  - `build: adjust TypeScript build config`
- `ci:` CI pipeline changes
  - `ci: update GitHub Actions Node version`
- `style:` formatting only (no logic change)
  - `style: run formatter on controller files`
- `revert:` revert a previous commit
  - `revert: fix(auth) - restore old session handling`

## Mapping message types to Git-flow actions

- On `feature/*`:
  - usually `feat:` (if it adds capability)
  - or `fix:` (if it corrects a bug discovered while building)
- On `release/*`:
  - often `chore:` (version bump, final cleanup)
  - and `fix:` for last-minute correctness fixes
- On `hotfix/*`:
  - almost always `fix:` (production-impacting bug)
  - plus a `chore:` commit for the version bump (if you separate it)

## Examples by scenario

- Deleting unused files:
  - `chore: remove unused mongoDB utility`
- Adding a new page/view:
  - `feat(views): add orders page`
- Fixing auth bug:
  - `fix(auth): block login when user is inactive`
- Version bump for a release:
  - `chore(release): bump version to 1.5.0`
- Version bump for a hotfix:
  - `chore(hotfix): bump version to 1.5.1`

## Quick checklist

- Does the first line start with a valid `<type>`?
- Is the subject in imperative mood (`add`/`fix`/`remove`)?
- Is scope included when it helps (`auth`, `shop`, `db`, etc.)?
- Is the subject short and without a trailing period?

