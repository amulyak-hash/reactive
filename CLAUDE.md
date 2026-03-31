# STRICT COMPLIANCE REQUIRED

**MANDATORY: Every instruction in this document and all `.claude/rules/*.md` files is REQUIRED, not optional. Violations will cause code rejection.**

# People Parley — Nx Monorepo

> Nx 22.6 monorepo — React 19 (web) + React Native 0.83 (mobile) + shared TypeScript library.
> Package manager: pnpm 10.32.x. Language: TypeScript 5.9 (strict).

## Workspace Map

| Package        | Path                  | Alias                           | Stack                          |
| -------------- | --------------------- | ------------------------------- | ------------------------------ |
| Web app        | `apps/web/`           | `@org/web`                      | React 19 + Vite 7 + MUI v7     |
| Mobile app     | `apps/mobile/`        | `@org/mobile`                   | React Native 0.83 (RN CLI)     |
| Shared lib     | `shared/`             | `@people-parley/shared`         | TypeScript — platform-agnostic |
| Shared mocking | `shared/src/mocking/` | `@people-parley/shared/mocking` | MSW + faker (dev/test only)    |

## Golden Rules — ALWAYS ENFORCED

1. **Platform guard**: if a file imports `react-dom`, `react-native`, or any MUI/RN component — it belongs in the app package, NOT in `shared/`. _(hook-enforced)_
2. **State ownership**: server data → TanStack Query v5. Client-only data → Zustand v5. No exceptions.
3. **Config vs constants**: `.env` changes it → `shared/src/config/`. Never changes → `shared/src/constants/`.
4. **No upward or cross imports**: `shared/` never imports from an app. Apps never import from each other.
5. **UI stays app-local**: components live in the app package. Shared exposes headless hooks, tokens, and logic only.

## Commands

| Command               | Purpose                                      |
| --------------------- | -------------------------------------------- |
| `pnpm start:web`      | Dev server (web)                             |
| `pnpm build:web`      | Production build (web)                       |
| `pnpm start:mobile`   | Metro bundler (mobile)                       |
| `pnpm run:mobile:ios` | Run on iOS simulator                         |
| `pnpm test`           | Run all tests (Jest)                         |
| `pnpm test:affected`  | Test changed packages only                   |
| `pnpm lint`           | Lint all packages (ESLint)                   |
| `pnpm format`         | Format all files (Prettier)                  |
| `pnpm format:check`   | Check formatting without writing             |
| `pnpm commit`         | Interactive conventional commit (commitizen) |
| `pnpm typecheck`      | Type-check all packages                      |
| `nx graph`            | Visualize dependency graph                   |
| `nx test @org/web`    | Test single package                          |

## Docs

- Architecture reference: `docs/ARCH.md`
- Build notes and setup: `docs/PLAN.md`
- Contributing guide: `docs/CONTRIBUTING.md`

---

## Rules (`.claude/rules/`)

```text
.claude/rules/
├── coding-principles.md        # Universal — always loaded
├── execution-flow.md           # Universal — always loaded
├── architecture.md             # Universal — always loaded
├── git-workflow.md             # Universal — always loaded
├── anti-patterns.md            # Universal — always loaded
├── typescript.md               # Cross-scope — all .ts/.tsx files
├── testing.md                  # Cross-scope — all test files
├── state-management.md         # Cross-scope — store, hooks, app files
├── zustand.md                  # Cross-scope — store files, web app
├── web-mocking.md              # Cross-scope — mocking files (web + shared)
├── web/
│   ├── folder-structure.md     # Web-only — directory layout, naming, placement rules
│   ├── styling.md              # Web-only — MUI styled(), theme tokens
│   ├── mui-usage.md            # Web-only — MUI practices, forbidden patterns
│   ├── react-hooks.md          # Web-only — React 19 patterns, web hooks
│   ├── forms.md                # Web-only — RHF + MUI Controller
│   ├── accessibility.md        # Web-only — ARIA, keyboard, semantics
│   └── storybook.md            # Web-only — Storybook conventions
├── shared/
│   ├── shared-hooks.md         # Shared-only — cross-platform hook rules
│   ├── api-client.md           # Shared-only — Axios transport
│   ├── design-tokens.md        # Shared-only — platform-agnostic tokens
│   ├── validation.md           # Shared-only — Zod v4 schemas
│   └── i18n.md                 # Shared-only — i18next conventions
└── mobile/
    └── placeholder.md          # Placeholder — TBD when mobile starts
```

### Always loaded (no `paths` — apply to every task)

| File                   | Domain                                                      |
| ---------------------- | ----------------------------------------------------------- |
| `coding-principles.md` | Core principles, non-negotiable rules, reuse guidelines     |
| `execution-flow.md`    | Required execution flow — inspect, reuse, implement, verify |
| `architecture.md`      | Separation of concerns, monorepo directory intent           |
| `git-workflow.md`      | Branching (JIRA IDs, scopes), conventional commits, PRs     |
| `anti-patterns.md`     | Auto-reject patterns, final validation checklist            |

### `web/` — Web-scoped (only for `apps/web/`)

| File                      | Domain                                                | Loaded when editing   |
| ------------------------- | ----------------------------------------------------- | --------------------- |
| `web/folder-structure.md` | Directory layout, naming conventions, placement rules | Web `apps/web/src/**` |
| `web/styling.md`          | MUI styled() API, theme tokens, responsive            | Web styles/tsx        |
| `web/mui-usage.md`        | MUI practices, forbidden patterns                     | Web `.tsx` and styles |
| `web/react-hooks.md`      | React 19 component patterns, web hooks                | Web `.tsx` and `.ts`  |
| `web/forms.md`            | React Hook Form + MUI Controller, useActionState      | Web `.tsx`            |
| `web/accessibility.md`    | Accessibility requirements                            | Web `.tsx`            |
| `web/storybook.md`        | Storybook conventions, CSF3                           | Web `.stories.tsx`    |

### `shared/` — Shared-scoped (only for `shared/`)

| File                      | Domain                                    | Loaded when editing           |
| ------------------------- | ----------------------------------------- | ----------------------------- |
| `shared/shared-hooks.md`  | Cross-platform hook rules, platform guard | `shared/src/hooks/**`         |
| `shared/api-client.md`    | Axios architecture, service patterns      | `shared/src/api-client/**`    |
| `shared/design-tokens.md` | Token authoring rules                     | `shared/src/design-tokens/**` |
| `shared/validation.md`    | Zod v4 schema rules, breaking changes     | `shared/src/validation/**`    |
| `shared/i18n.md`          | i18next conventions                       | `shared/src/i18n/**`          |

### `mobile/` — Placeholder

Empty until active mobile development begins.

### Cross-scope (web + shared)

| File                  | Domain                                 | Loaded when editing          |
| --------------------- | -------------------------------------- | ---------------------------- |
| `typescript.md`       | TypeScript strict mode, type imports   | All `.ts`/`.tsx` files       |
| `testing.md`          | Jest + Testing Library conventions     | Test files (all packages)    |
| `state-management.md` | TanStack Query v5 + Zustand v5 split   | Store, hooks, app files      |
| `zustand.md`          | Zustand v5 useShallow, store structure | Store files, web app         |
| `web-mocking.md`      | MSW Service Worker setup               | Mocking files (web + shared) |

---

## Hooks (`.claude/hooks/`) — Automated Enforcement

10 PreToolUse hooks (blocking, exit 2) and 2 PostToolUse hooks (warning, exit 0) run on every Write/Edit. Hook scripts and registration details are in `.claude/settings.json`. Individual rule files mark hook-enforced rules with _(hook-enforced)_.

All hooks skip test files (`*.test.*`, `*.spec.*`) and theme files (`*/theme/*`).
