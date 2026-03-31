# Git Workflow

> **MANDATORY:** Always confirm the correct JIRA ticket ID (`GA-<number>`) with the user **before** creating a branch or making any commit. Never assume the ticket ID from conversation context — ask explicitly.

## Branch Naming

All branches MUST include the JIRA ticket ID (`GA-<number>`). Include the app scope when changes target a single package; omit it for multi-package changes.

### Format

```text
<type>/GA-<number>-<scope>-<short-description>
```

### Types

| Type      | Purpose                         |
| --------- | ------------------------------- |
| `feature` | New features                    |
| `fix`     | Bug fixes                       |
| `chore`   | Tooling, dependencies, config   |
| `docs`    | Documentation changes           |
| `test`    | Test additions or test-only PRs |

### Scopes

| Scope    | When to use                    |
| -------- | ------------------------------ |
| `web`    | Changes only in `apps/web/`    |
| `mobile` | Changes only in `apps/mobile/` |
| `shared` | Changes only in `shared/`      |

> **No scope for multi-package changes:** When a branch touches multiple packages (e.g., web + shared, or all three), omit the scope segment entirely. The absence of a scope signals that the change is cross-cutting. The PR description details which packages are affected.

### Examples

```text
feature/GA-55-web-profile-setup-screen
fix/GA-102-shared-validation-schema-typo
chore/GA-78-upgrade-tanstack-query
test/GA-90-web-add-login-page-tests
docs/GA-45-shared-api-client-jsdoc
```

## Commits

- Format: Conventional Commits — enforced by commitlint on `commit-msg` hook
- MUST include JIRA ticket ID at the start of the commit subject
- No scope in commits — scope is NOT used
- Use `pnpm commit` for interactive commitizen prompt
- Keep commits atomic — one logical change per commit

### Commit Format

```text
<type>: GA-<number> <subject>

[optional body]
```

### Examples

```text
feat: GA-55 add profile setup screen

Implement avatar upload, display name, and bio fields
with React Hook Form + MUI Controller.
```

```text
fix: GA-102 correct email validation regex
```

```text
test: GA-90 add unit tests for login page
```

## Hooks (Husky)

- `pre-commit` → lint-staged (auto-format + lint staged files)
- `commit-msg` → commitlint (enforce conventional commit format)
- `pre-push` → configured

## Branches

- Default branch: `main`
- Development branch: `develop`
- PR target: `develop` (all feature/fix/test branches merge into `develop`)
- `develop` → `main` via release PRs only
- IMPORTANT: never force-push to `main` or `develop`

## Pull Requests

- Target branch: `develop` (unless explicitly stated otherwise)
- PR title format: `GA-<number>(<scope>): <short description>` — e.g., `GA-55(web): Add profile setup screen`
  - Scope values: `web`, `mobile`, `shared`, or omit parentheses for cross-package changes
  - Enforced by the `pr-title-check` GitHub Actions workflow
- PR template: `.github/pull_request_template.md` — auto-populated by GitHub on every new PR
- PR description MUST include:
  - JIRA ticket link
  - Summary of changes
  - Type of change and app scope affected
  - Screenshots/recordings for UI changes
- Link the JIRA ticket in the PR (use `GA-<number>` in title or description for auto-linking)

## Dependencies

- Package manager: pnpm 10.32.x — enforced via `packageManager` field
- IMPORTANT: never use `npm install` or `yarn add` — always `pnpm add`
- Shared deps in root `package.json` (hoisted)
- Lock file: `pnpm-lock.yaml` — always commit changes
- Before adding a dep, verify no existing dep covers the use case

## Security

- IMPORTANT: never commit `.env` files — only `.env.example` with placeholder values
- secretlint configured (`.secretlintrc.json`) — scans for leaked secrets
- Env var prefixes: `VITE_` for web client-exposed, no prefix for build-time only
- No hardcoded API keys, tokens, passwords, or secrets anywhere
