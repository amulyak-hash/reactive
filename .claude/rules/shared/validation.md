---
paths: shared/src/validation/**/*.ts
---

# Validation Rules (Zod v4 — Shared)

## Schema Location

- All validation schemas live in `shared/src/validation/`
- IMPORTANT: Zod schemas must NOT live in `shared/src/api-client/`
- Import alias: `@people-parley/shared` (exported from main barrel)

## Type Inference

- Derive TypeScript types from schemas: `type FormData = z.infer<typeof formSchema>`
- Export both schemas and inferred types from validation barrel

## Zod v4 Breaking Changes

### `.default()` behavior changed

In Zod v4, `.default()` short-circuits and returns the default directly without parsing.
Use `.prefault()` to replicate Zod v3 behavior:

```typescript
// Zod v4: default value must match OUTPUT type (not input)
const schema = z
  .string()
  .transform((val) => val.length)
  .default(0);
schema.parse(undefined); // => 0 (returned directly, NOT parsed)

// To get Zod v3 behavior (default is parsed through schema):
const schema = z
  .string()
  .transform((val) => val.length)
  .prefault('tuna');
schema.parse(undefined); // => 4 (parsed through transform)
```

### `z.function()` is no longer a schema

In v4, `z.function()` is a standalone factory — define `input` and `output` upfront:

```typescript
const myFn = z.function({
  input: [z.object({ name: z.string() })],
  output: z.string(),
});
myFn.implement((input) => `Hello ${input.name}`);
```

## Dependency

`validation/` is standalone — it only uses `zod`. No imports from other shared folders.
