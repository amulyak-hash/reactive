---
paths: apps/web/src/**/*.tsx, apps/web/src/**/styles.ts
---

# MUI Usage Rules

## Mandatory MUI Practices

- Prefer MUI primitives before creating custom wrappers
- Use `Box`, `Stack`, `Grid`, `Paper`, `Container`, `Typography`, `Button`, `IconButton`, `TextField`, `Dialog`, and other semantic MUI primitives
- Extend via `styled()` in `styles.ts`
- Ensure theme compatibility at all times
- Consume design tokens from `@people-parley/shared` through the theme

## Forbidden MUI Practices

- ❌ `sx` in production component code — use `styled()` in `styles.ts`
- ❌ ad-hoc theme bypasses — always go through the theme system
- ❌ inconsistent custom prop names
- ❌ styling in JSX — move to `styles.ts`
- ❌ unwrapped icon-only buttons without `aria-label`
- ❌ `<div>`, `<span>`, `<p>`, `<h1>`-`<h6>` — use MUI equivalents

## MUI Component Mapping

| Instead of    | Use                                  |
| ------------- | ------------------------------------ |
| `<div>`       | `Box`, `Stack`, `Paper`, `Container` |
| `<span>`      | `Typography`, `Box component="span"` |
| `<p>`         | `Typography`                         |
| `<h1>`-`<h6>` | `Typography variant="h1"` etc.       |
| `<button>`    | `Button`, `IconButton`               |
| `<input>`     | `TextField`, `Select`, `Checkbox`    |
| `<a>`         | `Link` (MUI) or React Router `Link`  |

---

## Icons

### Libraries (mirrors ref_app)

| Library                 | Role          | When to use                                                               |
| ----------------------- | ------------- | ------------------------------------------------------------------------- |
| `lucide-react`          | **Primary**   | All general UI icons — navigation, forms, actions, toggles                |
| `@phosphor-icons/react` | Secondary     | Niche contexts only: post reactions, badges, custom illustrated icons     |
| `@mui/icons-material`   | **Forbidden** | Never use — not aligned with ref_app; `lucide-react` covers all use cases |

### Import pattern — direct named imports, no barrel

```tsx
// ✅ Correct — named imports directly from the package
import { ChevronLeft, Sun, Moon, ArrowRight, MapPin } from 'lucide-react';

// ❌ Forbidden — @mui/icons-material
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DarkModeIcon from '@mui/icons-material/DarkMode';
```

### Sizing in MUI context

Lucide icons render as `<svg>`. Control size via a styled `Box` wrapper using `theme.spacing()` — never hardcode `size={20}` or `width="20px"`:

```tsx
// styles.ts
export const IconBox = styled(Box)(({ theme }) => ({
  width: theme.spacing(5), // 20px — small icon
  height: theme.spacing(5),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& svg': {
    width: '100%',
    height: '100%',
  },
}));

// Component.tsx
import { MapPin } from 'lucide-react';
<IconBox>
  <MapPin />
</IconBox>;
```

When an icon is passed directly to a MUI component prop (e.g. `startIcon`, `endIcon`, inside `IconButton`), it inherits the slot's sizing automatically — no wrapper needed:

```tsx
// ✅ Correct — icon inherits IconButton sizing
import { X } from 'lucide-react';
<IconButton aria-label="Close" onClick={onClose}>
  <X />
</IconButton>;

// ✅ Correct — icon inherits Button startIcon sizing
import { ArrowRight } from 'lucide-react';
<Button endIcon={<ArrowRight />}>Continue</Button>;
```

### Color

Lucide icons inherit `color` from the CSS `currentColor`. Never set color directly on the icon — control it from the parent styled component using `theme.palette.*`:

```tsx
// styles.ts
export const NavIconBox = styled(Box)(({ theme }) => ({
  color: theme.palette.text.secondary,
  ...theme.applyStyles('dark', {
    color: theme.palette.brand.yellow,
  }),
}));
```
