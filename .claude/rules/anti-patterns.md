# Anti-patterns (auto-reject — All Packages)

## Universal Anti-patterns

- giant Zustand store for unrelated concerns
- raw backend DTO rendered directly in UI without mapper
- duplicated fetch logic across components
- server data stored in Zustand instead of TanStack Query
- client-only state managed by TanStack Query
- platform-specific imports (`react-dom`, `react-native`, `@mui/*`) in `shared/`
- cross-app imports (web importing from mobile or vice versa)
- shared code importing from an app package
- Zod schemas in `shared/src/api-client/` (belongs in `shared/src/validation/`)
- UI state mixed into service modules
- using local form state alongside RHF for the same field
- marking a reference-based implementation as complete without a line-by-line comparison against the source
- writing hardcoded `rgba()`, `px`, or hex values with intent to "fix later" — use `alpha()`, `theme.spacing()`, `theme.palette.*` from the first line
- running the violation scan (grep for px/rgba/hex) once, fixing some matches, and moving on without re-running — the scan MUST loop until zero matches
- excusing hardcoded values with rationalizations ("keyframes can't access theme", "it's just 1px", "the line was already partially fixed") — every violation has a fix
- implementing a page or component without `data-testid` attributes and treating them as a follow-up task — they are part of the first draft

## Web-Only Anti-patterns

> These only apply when working in `apps/web/`. See also `styling.md`, `mui-usage.md`.

- API call inside reusable button/card/modal component
- raw Axios in JSX files or UI components
- business logic in `styles.ts`
- hardcoded theme values (colors, spacing, dimensions) in styles or tsx
- using `<div>`/`<span>` for convenience in web components
- creating a custom component when MUI primitive already satisfies the need
- missing tests or stories for reusable components
- missing `types.ts` or `index.ts` in any component or page folder

---

## Refactor-Specific Rule (Structure-Only)

During refactoring:

- UI, behavior, and responsiveness must remain **exactly the same**
- Refactor only structure, not logic or visuals
- Refactor **one component at a time**
- Any visible change = task failed

---

# Final Validation Checklists

## Universal Checklist (All Packages)

- [ ] `pnpm lint` exits with 0 errors
- [ ] `pnpm format:check` completes successfully
- [ ] `pnpm test` passes
- [ ] `pnpm typecheck` exits with 0 errors _(hook — warning)_
- [ ] no explicit `any` _(hook-enforced)_
- [ ] no platform imports in shared/ _(hook-enforced)_
- [ ] no direct state mutation in Zustand
- [ ] server data in TanStack Query, client data in Zustand
- [ ] all new types, services, stores, hooks follow project structure
- [ ] **reference comparison done** — if implementing from a reference/design, every element, interaction, hover state, animation, and variant in the reference has been verified present in the implementation (see `execution-flow.md` § Reference Comparison Checklist)

## Web-Specific Checklist (apps/web/ only)

- [ ] `pnpm build:web` succeeds
- [ ] **violation audit loop completed** _(hook-enforced)_ — `grep -n "px\|rgba\|rgb(\|#[0-9a-fA-F]"` returns **zero violations** across ALL files touched (`styles.ts`, `.tsx`, sub-components). This must be run in a loop — fix → re-scan → repeat until clean. Single-pass is not acceptable. See `execution-flow.md` § Violation Audit Loop.
- [ ] no production `sx` _(hook-enforced)_
- [ ] no inline `style` attribute _(hook-enforced)_ — exception: `motion.div` style props using `useTheme()` + `theme.spacing()`
- [ ] no hardcoded colors _(hook-enforced)_ — includes `rgba()`, `rgb()`, hex in gradients, JSX props (`htmlColor`), and keyframes. Use `alpha(theme.palette.*, opacity)` or `theme.palette.*`
- [ ] no raw Axios in UI components
- [ ] no direct state mutation in Zustand
- [ ] all required component files exist: `styles.ts`, `types.ts`, `index.ts`, `.test.tsx`, `.stories.tsx` _(hook — warning)_
- [ ] **`data-testid` coverage verified** — every page section, interactive element, and repeated item has a `data-testid`. Must be added during first implementation, not as a follow-up. See `execution-flow.md` § Data Test ID Checklist.
- [ ] accessibility verified
- [ ] responsive behavior verified
- [ ] all new types, services, stores, hooks, components, stories, and tests follow project structure
