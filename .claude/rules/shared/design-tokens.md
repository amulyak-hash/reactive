---
paths: shared/src/design-tokens/**/*.ts
---

# Design Token Rules

## Token Location

All design tokens live in `shared/src/design-tokens/`. This is the single source of truth for visual values across web and mobile.

## Mandatory Requirements

- Tokens are **plain TypeScript constants** — no CSS-in-JS, no platform-specific imports
- IMPORTANT: never import from `@mui/*`, `react-native`, `@emotion/*`, or any platform module
- Tokens must be importable by both web and mobile without platform-specific resolution

## Categories

One file per category, re-exported from `index.ts`:

| File             | Contains                                              |
| ---------------- | ----------------------------------------------------- |
| `colors.ts`      | Color palette (primary, secondary, semantic, neutral) |
| `spacing.ts`     | Spacing scale values                                  |
| `typography.ts`  | Font families, sizes, weights, line heights           |
| `radii.ts`       | Border radius values                                  |
| `shadows.ts`     | Box shadow definitions                                |
| `breakpoints.ts` | Responsive breakpoint values                          |
| `z-indices.ts`   | Z-index scale                                         |
| `index.ts`       | Barrel re-export of all categories                    |

## Naming Convention

- camelCase, **semantic names** — not raw values
- Name reflects purpose, not the value itself

```typescript
// ✅ Correct — semantic names
export const colorPrimary = '#1976d2';
export const colorError = '#d32f2f';
export const spacingXs = 4;
export const spacingMd = 16;
export const fontSizeBody = 14;
export const radiusMd = 8;

// ❌ Forbidden — raw value names
export const blue500 = '#1976d2';
export const size16 = 16;
export const px14 = 14;
```

## Consumption

- **Web**: MUI theme in `apps/web/src/theme/` maps tokens to `createTheme()` palette/spacing/typography
- **Mobile**: platform adapter (TBD — placeholder until mobile work starts)
- Components never import tokens directly — they consume via the theme system

## Dependency

`design-tokens/` is standalone — it must NOT import from any other shared folder.
