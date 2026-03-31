---
paths: apps/web/src/**/*.stories.tsx
---

# Storybook Conventions (Web)

## Required

- Every reusable component in `apps/web/src/components/` MUST have a `.stories.tsx` file
- Stories file MUST be co-located in the component folder
- Pages do NOT require stories

## Story Format — CSF3

- Use Component Story Format 3: `export default meta` + named `Story` exports
- Use `args` for props, not inline JSX (except composition stories using `render()`)
- Type with `Meta<typeof Component>` and `StoryObj<typeof Component>` from `@storybook/react`

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from './MyComponent';

const meta: Meta<typeof MyComponent> = {
  title: 'Components/MyComponent',
  component: MyComponent,
};

export default meta;
type Story = StoryObj<typeof MyComponent>;

export const Default: Story = {
  args: { label: 'Click me' },
};
```

## Story Naming and Ordering

Stories MUST follow this ordering convention within a file:

1. **`Default`** — always first, represents the most common usage
2. **State variants** — `Selected`, `Disabled`, `Loading`, `Error`, `Empty`
3. **Visual variants** — `Small`, `Large`, `Dark`, `WithIcon`, etc.
4. **Composition stories** — `AllVariants`, `AllSizes`, `KitchenSink` — disable controls for these

Name stories in PascalCase. Use descriptive names that reflect what's different from `Default`.

## Story Coverage Checklist

Every component's stories MUST cover:

- [ ] Default state (most common usage)
- [ ] All visual variants (size, color, variant prop values)
- [ ] All interactive states (selected, disabled, hover if non-trivial)
- [ ] Edge cases where applicable (empty text, long text, overflow)
- [ ] Dark mode (if component uses `applyStyles('dark', ...)` — verify via toolbar toggle)
- [ ] Composition story showing all variants together (for visual comparison)

## Meta Configuration

### `title` — Sidebar hierarchy

- Components: `title: 'Components/ComponentName'`
- Pages: `title: 'Pages/PageName'` (if stories are added)

### `argTypes` — REQUIRED on every meta

Declare `argTypes` for prop documentation and control panel behavior:

```typescript
argTypes: {
  variant: {
    control: 'radio',
    options: ['primary', 'secondary'],
    description: 'Visual style variant',
  },
  onClick: { action: 'clicked' },           // Log actions in panel
  icon: { table: { disable: true } },        // Hide non-controllable props
  colorScheme: { table: { disable: true } },  // Hide complex objects
},
```

Rules:

- Enum/union props → `control: 'radio'` or `control: 'select'`
- Boolean props → `control: 'boolean'`
- Callback props → `action: 'eventName'` (logs in Actions panel)
- Complex object/function props → `table: { disable: true }` (hide from controls)
- Add `description` to non-obvious props

### `parameters` — Per-story overrides

- `layout: 'fullscreen'` for full-page/background components
- `layout: 'padded'` for composition stories that need more space
- `controls: { disable: true }` for composition stories using `render()`
- Default layout is `'centered'` (set globally in preview.tsx)

## JSDoc on Stories

Add a JSDoc comment above each named story export explaining what it demonstrates:

```typescript
/** Selected state — shows selection badge and elevated shadow. */
export const Selected: Story = { ... };
```

## Decorators

### Global decorator (preview.tsx)

- `ThemeProvider` + `CssBaseline` + background-synced `Box` wraps ALL stories
- Theme toggle (light/dark) is in the toolbar — all stories respond automatically
- Do NOT add per-story ThemeProvider decorators

### Per-story decorators — layout context ONLY

Per-story decorators are allowed ONLY for layout context (max-width, fullscreen wrapper). They must:

- Use MUI components (`Box`, `Stack`) — never `<div>`
- Use theme tokens — never hardcoded colors or dimensions
- Use `bgcolor="background.default"` or `bgcolor="background.paper"` — never hex values

```typescript
// ✅ Correct — theme token
decorators: [
  (Story) => (
    <Box maxWidth={theme.spacing(70)}>
      <Story />
    </Box>
  ),
];

// ❌ Forbidden — hardcoded hex
decorators: [
  (Story) => (
    <Box bgcolor="#0f1117">
      <Story />
    </Box>
  ),
];
```

## Theme References in Stories

When stories need theme values for color schemes or mock data, import the named theme:

```typescript
import { lightTheme } from '../../theme/theme';

const colorScheme = {
  gradientFrom: lightTheme.palette.brand.purple,
  gradientTo: lightTheme.palette.brand.orange,
};
```

Do NOT import the backward-compat `theme` alias — use `lightTheme` explicitly.

## Forbidden

- No API calls or service imports — use static mock data
- No business logic — stories are visual documentation only
- No `any` types — type story args using `StoryObj<typeof Component>`
- No hardcoded colors/dimensions in decorators — use theme tokens
- No per-story ThemeProvider — use the global decorator
- No `@mui/icons-material` — use `lucide-react` (matches ref_app)

## Accessibility

- `@storybook/addon-a11y` checks all stories automatically (configured globally)
- If a story fails a11y checks, fix the component — never disable the check
- Verify all interactive elements have proper labels in the a11y panel

## Storybook Infrastructure

### Configuration files

| File                              | Purpose                                                         |
| --------------------------------- | --------------------------------------------------------------- |
| `apps/web/.storybook/main.ts`     | Framework, addons, story glob, staticDirs, TypeScript docgen    |
| `apps/web/.storybook/preview.tsx` | Global decorator, theme toggle, viewports, backgrounds, sorting |

### Global features (configured in preview.tsx)

- **Theme toggle** — toolbar switcher between light and dark themes
- **Viewports** — MUI breakpoint presets (xs 375px, sm 600px, md 900px, lg 1200px, xl 1536px)
- **Backgrounds** — surface, dark canvas, neutral, muted presets
- **Controls** — expanded by default with color/date matchers
- **Autodocs** — auto-generated documentation pages for all stories
- **Story sorting** — Pages first, then Components, alphabetical within groups

### Scripts

| Command                    | Purpose                              |
| -------------------------- | ------------------------------------ |
| `pnpm storybook:web`       | Dev server on port 6006              |
| `pnpm build-storybook:web` | Static build to `dist/storybook/web` |
