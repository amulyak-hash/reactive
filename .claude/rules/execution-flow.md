# Required Execution Flow

Before making changes, the agent MUST:

1. Inspect existing related files across the monorepo:
   - `shared/src/` — types, utils, hooks, constants, store, api-client, design-tokens
   - `apps/web/src/` — components, pages, theme, mocks
   - `apps/mobile/src/` — (when applicable)
2. Reuse an existing pattern if one exists — never duplicate
3. List which files must be created or updated
4. Implement code following all rules — including `data-testid` attributes on every section and interactive element during the **first draft**, not as a follow-up
5. Verify all non-negotiable rules
6. **Loop-until-clean audit (MANDATORY)** — scan all `styles.ts` **and `.tsx`** files for violations. This is NOT a single pass. See § Violation Audit Loop below.
   6b. **`data-testid` audit (MANDATORY)** — verify every page section, interactive element, and repeated item has a `data-testid`. See § Data Test ID Checklist below.
7. **Never copy Figma output layout values blindly** — Figma-generated code (e.g., `items-start`, absolute widths, fixed positions) reflects Figma's rendering model, not MUI's component behavior. Always validate each layout property against how the actual MUI components behave (e.g., MUI `Card` doesn't default to full width, so a flex container needs `alignItems: "stretch"`, not `"flex-start"` copied from Figma)
8. Run `pnpm typecheck` and confirm zero TypeScript errors
9. Run final validation checks
10. **Reference comparison (MANDATORY when implementing from a reference/design)** — after implementation is complete, perform a line-by-line comparison of every element, style, interaction, and state in the reference against the implemented code. List every missing or different item. Fix all gaps before proceeding. See detailed checklist below.
11. Refuse to mark the task complete if any required file, test, or rule is missing

---

## Reference Comparison Checklist (MANDATORY)

When implementing from a reference app, Figma design, or any visual specification, the agent MUST perform this comparison **after** implementation and **before** marking the task complete.

### Procedure

1. **Re-read the reference source** — open the original reference file(s) and the implemented code side by side
2. **Walk through every element** in the reference top-to-bottom and verify it exists in the implementation:
   - Every component / section / visual block
   - Every text string, label, and copy
   - Every icon and image
   - Every color, gradient, shadow, and border
   - Every spacing, dimension, and layout relationship
3. **Walk through every interaction** in the reference:
   - Hover states (color changes, scale, glow, shadow, transforms)
   - Click / tap states
   - Animations (entry, exit, infinite, spring physics, staggered delays)
   - Responsive breakpoints (mobile → tablet → desktop)
   - Dark mode / light mode variants
4. **Walk through every state variant**:
   - Loading, empty, error, populated
   - Authenticated vs unauthenticated
   - Active / inactive / disabled
5. **Produce a gap list** — for each missing or different item, note:
   - What is missing or different
   - Where in the reference it appears
   - Priority (high / medium / low)
6. **Fix all high and medium priority gaps** before proceeding
7. **Report low priority gaps** to the user for decision

### What counts as a gap

- A component or section present in the reference but absent in the implementation
- A hover/animation effect present in the reference but absent or degraded
- A dark mode variant present in the reference but absent
- Text content that differs (even subtly)
- Layout that doesn't match (wrong alignment, missing responsive behavior)
- Colors, gradients, or shadows that differ from the reference
- Missing interactive feedback (hover glow, scale, arrow indicators, etc.)

### No partial delivery

Do NOT present the implementation as complete if any reference element is missing. The user should never have to ask "what's missing" — the agent must proactively identify and resolve all gaps.

---

## Violation Audit Loop (MANDATORY)

After implementation, the agent MUST scan **every file touched** (not just `styles.ts` — also `.tsx` components, sub-components, and helper files) for hardcoded values. This is a **loop, not a single pass**.

### Procedure

1. **Run the scan** on every file in the feature:
   ```bash
   grep -n "px\|rgba\|rgb(\|#[0-9a-fA-F]" <file>
   ```
2. **Exclude only genuine non-violations**: `import` statements, comments, `clipPath` polygon percentages, `scale()` / `rotate()` unitless values
3. **For every remaining match** — fix it. Do NOT rationalize why it's acceptable. Common traps:
   - `1px` borders next to theme palette values — the `1px` is still a violation → `theme.spacing(0.25)`
   - `35px` in gradient stops where colors were already converted to `alpha()` — the dimension is still a violation → `theme.spacing(8.75)`
   - `rgba(...)` on JSX props like `htmlColor` — still a violation → `theme.palette.brand.*`
   - Keyframe `px` values excused as "can't access theme" — wrong, use factory functions: `const createKeyframe = (theme: Theme) => keyframes\`...\``
4. **Re-run the scan** after fixes
5. **Repeat steps 2–4** until grep returns **zero violations**
6. Only then proceed to the next step in the execution flow

### Scope

Scan ALL files touched in the feature, including:

- `styles.ts` — styled component definitions
- `*.tsx` — component files (inline `style` props on `motion.div`, JSX color props like `htmlColor`)
- Sub-component files (e.g., `AnimatedBackground.tsx`)
- Any helper or utility files created for the feature

### No excuses

- "Keyframes can't access theme" → use `const createKf = (theme: Theme) => keyframes\`...\``
- "It's just a `1px` border" → `theme.spacing(0.25)`
- "The color was already partially fixed" → re-read the entire line, not just the part you changed
- "It's a `motion.div` inline style" → use `useTheme()` + `theme.spacing()` in the component
- "This is a comment-only match" → exclude it and move on, but verify it IS a comment

4. **Extract reusable components while building pages** — during page implementation, identify repeated or commonly needed UI patterns (e.g., styled cards, section headers, action bars, status badges, info rows, icon buttons with labels). Wrap these as MUI-based reusable components in `apps/web/src/components/` with the full component contract (`.tsx`, `styles.ts`, `types.ts`, `index.ts`, `.stories.tsx`, `.test.tsx`). Do this proactively — don't wait for a second usage to appear; if a UI element is generic enough to be used on other pages, extract it immediately.
5. Implement code following all rules
6. Verify all non-negotiable rules
7. Scan all `styles.ts` **and `.tsx`** files for raw numeric values — every dimension must use a theme token
8. **Never copy Figma output layout values blindly** — Figma-generated code (e.g., `items-start`, absolute widths, fixed positions) reflects Figma's rendering model, not MUI's component behavior. Always validate each layout property against how the actual MUI components behave (e.g., MUI `Card` doesn't default to full width, so a flex container needs `alignItems: "stretch"`, not `"flex-start"` copied from Figma)
9. Run `pnpm typecheck` and confirm zero TypeScript errors
10. Run final validation checks
11. Refuse to mark the task complete if any required file, test, or rule is missing

---

## Data Test ID Checklist (MANDATORY)

Every page and component MUST include `data-testid` attributes **during the first implementation** — not as a follow-up fix. These are required for testing and must be part of the initial code.

### What needs a `data-testid`

- **Page root container** — e.g., `data-testid="splash-screen"`
- **Every major section/panel** — e.g., `data-testid="splash-welcome-section"`, `data-testid="splash-community-grid"`
- **Every interactive element** — buttons, links, inputs, toggles — e.g., `data-testid="splash-signup-button"`
- **Every repeated/mapped item** — use a dynamic suffix — e.g., `data-testid={`splash-feature-${feature.icon}`}`
- **Key visual landmarks** — logo, powered-by, trust section

### Naming convention

- Prefix with the page/component name: `splash-`, `login-`, `profile-`
- Use kebab-case: `splash-signup-button`, not `splashSignupButton`
- Be specific: `splash-card-left`, not `card-1`

### Rules

- **Page-level / one-off UI**: hardcode `data-testid` directly on the root and key elements
- **Reusable components**: MUST accept `data-testid` as a prop typed in `types.ts` and forward it to the root element — never hardcode inside a reusable component

### Reusable component `data-testid` pattern (REQUIRED)

Every reusable component's props interface in `types.ts` MUST include `data-testid`:

```typescript
// types.ts
export interface ButtonProps {
  // ... other props
  'data-testid'?: string;
}
```

Forward it to the root element in the component:

```tsx
// Button.tsx
export function Button({ children, onClick, 'data-testid': testId, ...rest }: ButtonProps) {
  return (
    <StyledButton onClick={onClick} data-testid={testId} {...rest}>
      {children}
    </StyledButton>
  );
}
```

Consumers (pages) pass the `data-testid` when using the component:

```tsx
// ProfileSetupScreen.tsx (page-level — hardcoded)
<Button data-testid="profile-continue-button" onClick={handleContinue}>
  Continue
</Button>
```

### Audit

After implementation, grep the component file to verify coverage:

```bash
grep -c "data-testid" <file.tsx>
```

If the count is low relative to the number of sections and interactive elements, IDs are missing.

---

## If Anything Is Unclear (MANDATORY behavior)

Before writing code, Agent MUST:

1. Locate an existing similar component in the web app and mirror patterns
2. Locate an existing similar store in `shared/src/store/` and mirror state/action structure
3. Locate an existing similar API client in `shared/src/api-client/` and mirror Axios usage
4. Locate existing hooks in `shared/src/hooks/` and mirror cross-platform patterns
5. If none exists, ask for clarification and propose one recommended approach aligned with these rules

---

## Reuse Existing Building Blocks (MANDATORY)

Search and reuse existing modules first from:

- `shared/src/utils/` — pure helper functions
- `shared/src/hooks/` — cross-platform React hooks
- `shared/src/types/` — shared domain types
- `shared/src/constants/` — route keys, enums, patterns
- `shared/src/store/` — Zustand stores
- `shared/src/api-client/` — Axios services
- `shared/src/validation/` — Zod schemas
- `shared/src/design-tokens/` — color, spacing, typography tokens
- `shared/src/config/` — environment-specific config

Prefer extending an existing utility, type, hook, store slice, or service over adding a duplicate with a different name.

Introduce a new shared helper only when:

- no existing abstraction fits, AND
- the behavior is reusable across multiple call sites
