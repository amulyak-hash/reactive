---
paths: apps/web/src/**/*.tsx
---

# Accessibility Requirements

## Non-negotiable Accessibility Rules

- All images need descriptive `alt`
- All icon-only buttons need `aria-label`
- Interactive controls must be keyboard accessible
- Inputs must have labels and error associations
- Focus order must be logical
- Semantic elements must be used (MUI components provide this)
- Links opening new tabs must include `rel="noopener noreferrer"`
- Modals/dialogs must preserve focus behavior per MUI conventions

## Forbidden Accessibility Failures

- clickable non-semantic layout elements
- missing labels on interactive controls
- hidden meaning conveyed only by color
- empty alt text unless truly decorative
- keyboard-inaccessible custom interactions

## Examples

### Icon-only button (correct)

```tsx
import { X } from 'lucide-react';

<IconButton aria-label="Close dialog" onClick={onClose}>
  <X />
</IconButton>;
```

### Form input with error association (correct)

```tsx
<Controller
  name="email"
  control={control}
  render={({ field, fieldState: { error } }) => (
    <TextField
      {...field}
      label="Email address"
      error={Boolean(error)}
      helperText={error?.message}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? 'email-error' : undefined}
    />
  )}
/>
```

### Image with descriptive alt (correct)

```tsx
<Box component="img" src={logoSrc} alt="Company logo — People Parley" />
```

### Link opening new tab (correct)

```tsx
<Link href={url} target="_blank" rel="noopener noreferrer">
  View documentation
</Link>
```
