# Coding Principles (Universal)

## General Coding Guidelines

- Follow clean code principles
- Use meaningful variable and function names that reflect business intent
- Ensure proper error handling and logging
- Prioritize self-explanatory code over comments
- Follow best security practices (input validation, no hardcoded secrets)
- Use consistent formatting and follow project-specific linting rules

---

## Core Development Principles

- **Consistency**: consistent code is crucial for readability and maintenance across a monorepo
- **Clarity**: write code that is clear and easy to understand
- **Simplicity**: avoid complexity when simpler solutions exist
- **Scalability**: ensure code is scalable and maintainable
- **Platform-awareness**: shared code must never import platform-specific modules

---

## Non-negotiable Rules (All Packages)

> These rules apply to ALL code — web, mobile, and shared. Web-specific rules (styling, MUI) are in `styling.md`, `mui-usage.md`, and `apps/web/CLAUDE.md`.
> Items marked _(hook-enforced)_ are automatically blocked by `.claude/hooks/` on Write/Edit.

- **NEVER** use explicit `any` _(hook-enforced)_ — use specific types or `unknown`
- **NEVER** hardcode colors, spacing, font sizes, shadows, border radius, z-index, widths, heights, max-widths, min-heights, line-heights, or ANY numeric/px dimension — every value in `styles.ts` **and `.tsx` files** must come from `theme.spacing()`, `theme.palette.*`, `alpha()`, or another theme token _(hook-enforced)_
  - This includes `rgba()`, `rgb()`, hex — use `alpha(theme.palette.*, opacity)` from `@mui/material/styles`
  - This includes CSS gradients — compose from `theme.palette.brand.*` / `alpha()`, never raw color strings
  - This includes `motion.div` inline `style` props — use `useTheme()` + `theme.spacing()` for any dimension
  - This applies from the **first line of code** — never write raw values with intent to "fix later"
  - When translating ref_app Tailwind values, convert to theme tokens immediately (e.g., `w-72` → `theme.spacing(72)`, `text-purple-600` → `theme.palette.brand.purple`)
- **NEVER** use `<div>` or `<span>` in component JSX _(hook-enforced)_
- **NEVER** use inline `sx` for production component styling _(hook-enforced)_
- **NEVER** use inline `style` attribute _(hook-enforced)_
- **NEVER** import `react-dom`, `react-native`, or `@mui/*` in `shared/` _(hook-enforced)_
- **NEVER** skip required component files (styles.ts, types.ts, index.ts, tests, stories)
- **NEVER** duplicate existing utilities, hooks, store patterns, service clients, constants, or types
- **NEVER** call APIs directly inside UI components — use services and hooks
- **NEVER** place business logic inside presentational elements
- **NEVER** mutate Zustand state directly
- **NEVER** create untyped Axios responses
- **NEVER** omit accessibility attributes
- **NEVER** store server data in Zustand or manage UI state with TanStack Query
- **ALWAYS** reuse existing utilities, hooks, validations, constants, stores, and shared types before creating new ones
- **ALWAYS** separate UI, state, service, and mapping concerns
- **ALWAYS** use `type` keyword for type-only imports (`consistent-type-imports` enforced)
- **ALWAYS** type API requests, responses, store state, actions, component props, and mapper outputs
- **ALWAYS** include blank lines between import groups
- **ALWAYS** keep import order and grouping compatible with ESLint rules
- **ALWAYS** ensure accessibility: semantic controls, valid labels, alt text, keyboard support
- **ALWAYS** use a prop for reusable components, and hardcode `data-testid` only in page-level or one-off UI
- **NEVER** use `dangerouslySetInnerHTML` — XSS attack vector; use a sanitization library if raw HTML is absolutely required
- **NEVER** use `eval()`, `Function()`, or `new Function()` — dynamic code execution is a security risk
- **NEVER** add a new dependency without running `pnpm audit` to check for known vulnerabilities
