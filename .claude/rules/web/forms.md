---
paths: apps/web/src/**/*.tsx
---

# Forms Rules — Web App (React Hook Form + Zod v4)

## Mandatory Form Requirements

- All forms MUST use Zod schema validation (schemas in `shared/src/validation/`)
- All forms MUST use RHF `zodResolver` from `@hookform/resolvers`
- MUI inputs MUST integrate through `Controller` unless RHF-native
- Validation messages MUST be visible and accessible
- Form submission MUST use typed values inferred from schema via `z.infer<>`
- Do not manage RHF-controlled values in local component state

## React 19 Alternative: `useActionState`

For simple forms that don't need RHF's field-level control, React 19's `useActionState` is a lighter alternative:

```tsx
import { useActionState } from 'react';

const [state, submitAction, isPending] = useActionState(async (prev, formData) => {
  const result = await submitForm(formData);
  return result;
}, null);
```

Use RHF + Zod for complex forms with validation. Use `useActionState` for simple server-action forms.

## Required Accessibility Wiring

Every form input must include:

- `error` prop (boolean)
- `helperText` prop (error message)
- `aria-invalid` attribute
- `aria-describedby` attribute (when error present)
- visible label or valid `aria-label`

## Example (RHF + Zod v4 + MUI)

```tsx
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { loginSchema } from '@people-parley/shared';

type LoginForm = z.infer<typeof loginSchema>;

function LoginPage() {
  const { control, handleSubmit } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
    </form>
  );
}
```
