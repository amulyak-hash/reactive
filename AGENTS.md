# STRICT COMPLIANCE REQUIRED

**MANDATORY: Every instruction in this document and all `.claude/rules/*.md` files is REQUIRED, not optional. Violations will cause code rejection.**

# Codex Operating Guide — People Parley

This file defines how Codex should operate in this repository.

- Treat `AGENTS.md` as the primary agent entry point for repository-specific behavior.
- Apply every relevant rule from `.claude/rules/` even though the directory uses legacy Claude naming.
- Follow the required workflow: inspect first, reuse existing patterns, implement the smallest correct change, then verify.
- Keep package boundaries intact. If a change conflicts with the architecture below, the architecture wins.
- Prefer repository commands and existing tooling over ad hoc alternatives.

## Repository Snapshot

> Nx 22.6 monorepo — React 19 (web) + React Native 0.83 (mobile) + shared TypeScript library.
> Package manager: pnpm 10.32.x. Language: TypeScript 5.9 (strict).

## Workspace Map

| Package        | Path                  | Alias                           | Codex Notes                    |
| -------------- | --------------------- | ------------------------------- | ------------------------------ |
| Web app        | `apps/web/`           | `@org/web`                      | React 19 + Vite 7 + MUI v7     |
| Mobile app     | `apps/mobile/`        | `@org/mobile`                   | React Native 0.83 (RN CLI)     |
| Shared lib     | `shared/`             | `@people-parley/shared`         | Platform-agnostic logic only   |
| Shared mocking | `shared/src/mocking/` | `@people-parley/shared/mocking` | MSW + faker for dev/test only  |

## Non-Negotiable Rules

1. **Platform guard**: if a file imports `react-dom`, `react-native`, or any MUI/RN component, it belongs in an app package, never in `shared/`. _(hook-enforced)_
2. **State ownership**: server data uses TanStack Query v5. Client-only state uses Zustand v5.
3. **Config vs constants**: values that can change via `.env` live in `shared/src/config/`. Fixed values live in `shared/src/constants/`.
4. **Import direction**: `shared/` never imports from an app. Apps never import from each other.
5. **UI ownership**: visual components stay app-local. Shared code exposes headless hooks, tokens, schemas, utilities, and business logic only.

## Codex Expectations

- Inspect the target area before editing and match the existing local pattern unless a rule requires otherwise.
- Reuse existing hooks, stores, schema helpers, API clients, components, and tokens before creating new abstractions.
- Make minimal edits that solve the task completely without widening scope unnecessarily.
- Preserve strict typing. Do not add `any`, unsafe assertions, or workaround code to force a pass.
- Verify with the narrowest useful command for the affected area before finishing.
- If a rule in this file and a lower-level preference conflict, follow the rule and document the reason in the final response.

## Standard Commands

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
| `nx test @org/web`    | Test a single package                        |

## Verification Guidance For Codex

- Use package-scoped Nx commands when a full workspace run is unnecessary.
- Prefer `pnpm typecheck`, `pnpm lint`, and relevant test commands over manual inspection alone.
- If verification is skipped because it is too expensive, blocked, or unrelated, say so explicitly in the final response.
- Do not claim success without either running checks or clearly stating what was not verified.

## Reference Docs

- Architecture reference: `docs/ARCH.md`
- Build notes and setup: `docs/PLAN.md`
- Contributing guide: `docs/CONTRIBUTING.md`

## Rule Loading Map

Codex should read this file first, then load only the relevant rule files for the task at hand. The `.claude/` directory is the source of truth for detailed instructions.

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
├── visualisations-rules.md     # Cross-scope — all chart and diagram work
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

### Always Load

| File                   | Why Codex Must Load It                                      |
| ---------------------- | ----------------------------------------------------------- |
| `coding-principles.md` | Core principles, non-negotiable rules, reuse guidelines     |
| `execution-flow.md`    | Required execution flow: inspect, reuse, implement, verify  |
| `architecture.md`      | Separation of concerns and monorepo intent                  |
| `git-workflow.md`      | Branching, commit conventions, and PR expectations          |
| `anti-patterns.md`     | Auto-reject patterns and final validation checklist         |

### Web Scope: `apps/web/`

| File                      | Domain                                                | Load When Editing         |
| ------------------------- | ----------------------------------------------------- | ------------------------- |
| `web/folder-structure.md` | Directory layout, naming conventions, placement rules | `apps/web/src/**`         |
| `web/styling.md`          | MUI styled() API, theme tokens, responsive patterns   | Web styles and `.tsx`     |
| `web/mui-usage.md`        | MUI practices and forbidden patterns                  | Web `.tsx` and styles     |
| `web/react-hooks.md`      | React 19 component patterns and web hooks             | Web `.tsx` and `.ts`      |
| `web/forms.md`            | React Hook Form + MUI Controller, `useActionState`    | Web form components       |
| `web/accessibility.md`    | Accessibility requirements                            | User-facing web UI        |
| `web/storybook.md`        | Storybook conventions, CSF3                           | Web `.stories.tsx` files  |

### Shared Scope: `shared/`

| File                      | Domain                                    | Load When Editing              |
| ------------------------- | ----------------------------------------- | ------------------------------ |
| `shared/shared-hooks.md`  | Cross-platform hook rules, platform guard | `shared/src/hooks/**`          |
| `shared/api-client.md`    | Axios architecture and service patterns   | `shared/src/api-client/**`     |
| `shared/design-tokens.md` | Token authoring rules                     | `shared/src/design-tokens/**`  |
| `shared/validation.md`    | Zod v4 schema rules and breaking changes  | `shared/src/validation/**`     |
| `shared/i18n.md`          | i18next conventions                       | `shared/src/i18n/**`           |

### Cross-Scope Rules

| File                  | Domain                                 | Load When Editing          |
| --------------------- | -------------------------------------- | -------------------------- |
| `typescript.md`       | TypeScript strict mode and type imports| All `.ts` and `.tsx` files |
| `testing.md`          | Jest + Testing Library conventions     | Test files in any package  |
| `state-management.md` | TanStack Query v5 + Zustand v5 split   | Stores, hooks, app files   |
| `zustand.md`          | Zustand v5 `useShallow`, store shape   | Store files, web app       |
| `visualisations-rules.md` | Approved visualization-library policy | Chart, graph, and diagram work |
| `web-mocking.md`      | MSW Service Worker setup               | Mocking files              |

### Mobile Scope

`mobile/placeholder.md` is informational only until active mobile development begins. Codex should still respect the top-level architecture and platform-boundary rules for mobile changes.

## Execution Checklist For Codex

1. Read `AGENTS.md`.
2. Load the always-on rule files.
3. Load only the additional scoped rules that match the files being changed.
4. Inspect nearby code for established patterns and reusable helpers.
5. Implement the smallest correct fix or feature.
6. Run targeted verification.
7. Report what changed, what was verified, and any remaining risk.

## Hooks And Enforcement

`.claude/hooks/` contains automated enforcement used by this repository.

- 10 PreToolUse hooks block invalid writes with exit code `2`.
- 2 PostToolUse hooks emit warnings with exit code `0`.
- Hook registration and script wiring live in `.claude/settings.json`.
- Individual rule files mark hook-enforced policies with `_(hook-enforced)_`.

All hooks skip test files (`*.test.*`, `*.spec.*`) and theme files (`*/theme/*`).
