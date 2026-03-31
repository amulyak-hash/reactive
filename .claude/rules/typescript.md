---
paths: **/src/**/*.ts, **/src/**/*.tsx
---

# TypeScript Rules

## Strict Mode Requirements

- **NEVER** use explicit `any` _(hook-enforced)_ — use specific types or `unknown`
- Use `unknown` only when truly necessary, then narrow it
- Always type:
  - component props
  - API payloads and responses
  - service return types
  - Zustand state and actions
  - hook return values where useful
  - design token objects

## Type Import Rules

- IMPORTANT: always use `type` keyword for type-only imports — `consistent-type-imports` is enforced
- Prefer `interface` for object shapes, `type` for unions/intersections/mapped types
- Avoid enums — prefer `as const` objects with derived union types

```typescript
// ✅ Correct
import type { UserModel } from '@people-parley/shared';

// ❌ Forbidden
import { UserModel } from '@people-parley/shared';
```

## Path Aliases

- `@people-parley/shared` → `shared/src/index.ts`
- `@people-parley/shared/mocking` → `shared/src/mocking/index.ts`

## Enforcement Rules

- `@typescript-eslint/no-explicit-any`: warn (error in hooks)
- `@typescript-eslint/no-unused-vars`: error (`_` prefix ignored)
- `@typescript-eslint/consistent-type-imports`: error
- `@typescript-eslint/no-floating-promises`: error
- `@typescript-eslint/await-thenable`: error
- `@typescript-eslint/return-await`: error

## TypeScript Config

- `strict: true`, `noUncheckedIndexedAccess: true`
- Target: ES2022, module: ESNext, moduleResolution: bundler

## Required Practices

- Use discriminated unions for state variants when applicable
- Prefer `Readonly`, `Record`, and literal unions over vague object shapes
- Function return types: let TypeScript infer — only annotate for public APIs or when compiler can't infer

```typescript
// ✅ Correct: unused var prefix, typed async return, typed catch
const _unusedValue = 'ignored';

const handleSubmit = async (): Promise<void> => {
  await saveData();
};

try {
  return await fetchResource();
} catch (error: unknown) {
  throw error;
}
```
