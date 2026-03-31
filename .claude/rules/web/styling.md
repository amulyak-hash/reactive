---
paths: apps/web/src/**/styles.ts, apps/web/src/**/*.tsx
---

# Styling Rules (Web App)

## Absolute Styling Requirements

- **ALWAYS** define component styling in `styles.ts` using MUI `styled()` API
- **ALWAYS** use theme tokens for every visual value
- **ALWAYS** use MUI utility/layout components: `Box`, `Stack`, `Grid`, `Container`, `Paper`
- **ALWAYS** use `Typography` for text
- **ALWAYS** place responsive styling in `styles.ts`
- **ALWAYS** use `shouldForwardProp` when custom style props are introduced

## Forbidden Styling Patterns (hook-enforced)

- ❌ hardcoded hex, rgb, rgba, hsl — use `theme.palette.*` or `alpha(theme.palette.*, opacity)`
- ❌ hardcoded `"16px"`, `"14px"`, `"1rem"` — use `theme.spacing()`
- ❌ raw numeric dimensions (e.g., `width: 368`, `minHeight: 64`) — use `theme.spacing(n)`
- ❌ raw numeric values in MUI component JSX props that control dimensions (e.g., `<Skeleton width={40} />`) — create a styled component in `styles.ts`
- ❌ bare `0` as a dimension value — use `theme.spacing(0)`
- ❌ `margin: "0 auto"` — split into `marginLeft: "auto"` + `marginRight: "auto"`
- ❌ inline `style` attribute — create a styled component
- ❌ production `sx` prop — use `styled()` in `styles.ts`
- ❌ CSS modules, Tailwind, raw CSS files
- ❌ `<div>`, `<span>`, `<p>`, `<h1>`-`<h6>` — use MUI components
- ❌ redundant CSS resets already handled by MUI `CssBaseline`

### Semi-transparent Colors and Gradients

**ALWAYS** use `alpha()` from `@mui/material/styles` for any semi-transparent color:

```typescript
import { alpha, styled } from '@mui/material/styles';

// ✅ Correct — theme-derived semi-transparent color
backgroundColor: alpha(theme.palette.brand.purple, 0.15);
// ✅ Correct — theme-derived gradient
background: `linear-gradient(to right, ${theme.palette.brand.purple}, ${theme.palette.brand.orange})`;

// ✅ Correct — gradient with opacity
background: `linear-gradient(to right, ${alpha(theme.palette.brand.purple, 0.8)}, ${alpha(
  theme.palette.brand.orange,
  0.5,
)})`;

// ❌ Forbidden — hardcoded rgba in gradient
background: 'linear-gradient(to right, rgba(147, 51, 234, 0.8), rgba(249, 115, 22, 0.5))';
```

Extract reusable gradient helpers inside `styles.ts` when the same gradient is used 3+ times:

```typescript
const brandGradient = (theme: Theme) =>
  `linear-gradient(to right, ${theme.palette.brand.purple}, ${theme.palette.brand.orange})`;
```

### Framer Motion / `motion.div` Inline Styles

When `motion.div` requires `style` props for positioning (which cannot use `styled()`), use `useTheme()` in the component and reference `theme.spacing()`:

```typescript
// ✅ Correct — dimensions from theme
const theme = useTheme();
<motion.div style={{ top: theme.spacing(8), maxWidth: theme.spacing(168) }} />

// ❌ Forbidden — hardcoded px
<motion.div style={{ top: '32px', maxWidth: '672px' }} />
```

### First-Draft Compliance

These rules apply from the **first line of code written** — not as a "cleanup" step. Never write raw values with intent to convert later. When translating from a reference app (Tailwind, CSS, Figma), convert to theme tokens immediately:

| Reference value            | Theme token                               |
| -------------------------- | ----------------------------------------- |
| `w-72` (288px)             | `theme.spacing(72)`                       |
| `text-purple-600`          | `theme.palette.brand.purple`              |
| `rgba(147, 51, 234, 0.15)` | `alpha(theme.palette.brand.purple, 0.15)` |
| `text-4xl` (36px)          | `theme.spacing(9)`                        |
| `shadow-2xl`               | `theme.shadows[21]`                       |
| `font-semibold` (600)      | `theme.typography.fontWeightSemiBold`     |

### Mode-aware slate text tokens (MANDATORY)

The ref_app uses Tailwind's `slate` color scale for secondary/muted text. These are mode-aware — **never use `alpha(text.primary, 0.4)` or a fixed `text.secondary`** for these cases. Use the semantic palette tokens below:

| Ref class (light)          | Ref class (dark)           | Token                     | Use for                                                      |
| -------------------------- | -------------------------- | ------------------------- | ------------------------------------------------------------ |
| `text-slate-600` (#475569) | `text-slate-400` (#94a3b8) | `theme.palette.mutedText` | Taglines, subtitles, card footer labels, secondary body copy |
| `text-slate-500` (#64748b) | `text-slate-600` (#475569) | `theme.palette.dimText`   | Trust/legal footers, powered-by labels, fine-print copy      |

These tokens are defined in `apps/web/src/theme/theme.ts` and automatically switch between light and dark values via separate `lightTheme` / `darkTheme` objects. **Do not replicate these with `alpha()` or hardcoded hex.**

## MUI v7 Notes

- MUI v7 changed compound class names (e.g., `clickableColorPrimary` → `clickable` + `colorPrimary`). When writing custom `styleOverrides` or selectors using `chipClasses`, `buttonClasses` etc., use separate individual class combinations
- MUI v7 supports `cssVariables: true` and `modularCssLayers` in `createTheme()` — prefer CSS variables for runtime theme switching (light/dark mode)
- Use `ThemeProvider` with `disableTransitionOnChange` for instant theme switching without flash

## Correct Pattern

```typescript
import Box from '@mui/material/Box';
import { alpha, styled } from '@mui/material/styles';

export const StyledRoot = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
  color: theme.palette.text.primary,
  border: `1px solid ${alpha(theme.palette.brand.purple, 0.2)}`,
  // Dark mode override
  ...theme.applyStyles('dark', {
    backgroundColor: theme.palette.darkCanvas[800],
  }),
}));
```

## Responsive Rules

- Base styles first
- Adjust with `theme.breakpoints.up()` / `down()` / `between()`
- No raw media query strings in component files
),
}));
```

## Responsive Rules

- Base styles first
- Adjust with `theme.breakpoints.up()` / `down()` / `between()`
- No raw media query strings in component files
s

- Base styles first
- Adjust with `theme.breakpoints.up()` / `down()` / `between()`
- No raw media query strings in component files
s

- Base styles first
- Adjust with `theme.breakpoints.up()` / `down()` / `between()`
- No raw media query strings in component files
s

- Base styles first
- Adjust with `theme.breakpoints.up()` / `down()` / `between()`
- No raw media query strings in component files
