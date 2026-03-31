---
paths: shared/src/store/**/*.ts, shared/src/hooks/**/*.ts, apps/web/src/**/*.ts, apps/web/src/**/*.tsx
---

# State Management Rules

## Ownership Split — No Exceptions

| Data type              | Owner             | Examples                                          |
| ---------------------- | ----------------- | ------------------------------------------------- |
| Server data (from API) | TanStack Query v5 | User profiles, lists, search results              |
| Client-only data       | Zustand v5        | Auth session, UI state, modal/drawer, preferences |

- **NEVER** store server data in Zustand
- **NEVER** manage UI toggles or client preferences with TanStack Query
- **NEVER** duplicate server data from TanStack Query into Zustand

## TanStack Query v5 Rules

### Use `queryOptions()` for reusable query configs (REQUIRED)

The `queryOptions()` helper is THE recommended v5 pattern. It co-locates `queryKey`, `queryFn`, and options with full type safety:

```typescript
import { queryOptions } from '@tanstack/react-query';
import { getUser } from '../api-client/users';

// Define reusable query options per domain
export function userQueryOptions(userId: string) {
  return queryOptions({
    queryKey: ['users', userId],
    queryFn: () => getUser(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Usage — works with all TanStack Query APIs
useQuery(userQueryOptions(userId));
useSuspenseQuery(userQueryOptions(userId));
queryClient.prefetchQuery(userQueryOptions(userId));
queryClient.invalidateQueries({ queryKey: userQueryOptions(userId).queryKey });
```

### Query patterns

- Place `queryOptions` factories in `shared/src/hooks/` or a dedicated `shared/src/queries/` file
- Use `useQuery` for standard reads, `useSuspenseQuery` when data must be defined (no `undefined` checks)
- Use `useMutation` for writes — always invalidate related queries on success
- Optimistic updates: use `onMutate` / `onError` / `onSettled` pattern
- IMPORTANT: `useSuspenseQuery` guarantees `data` is always defined at the type level — prefer it when used with React Suspense boundaries

```typescript
// ✅ data is always defined — no undefined check needed
const { data: user } = useSuspenseQuery(userQueryOptions(userId));
//     ^? const user: UserModel (never undefined)
```

### Query key rules

- Always include all variables used by `queryFn` in the `queryKey`
- Use array format: `['entity', id]`, `['entity', 'list', filters]`
- Centralize in `queryOptions` factories — do NOT scatter raw keys across components

## Zustand v5 Rules

- See `zustand.md` for detailed v5 patterns (useShallow, double-call create syntax)
- Shared stores: `shared/src/store/` — used by both web and mobile
- App-local stores: live in the app package if only one app needs them
- One store per domain (auth, ui, preferences) — no giant global stores
- IMPORTANT: use `useShallow` for all object/array selectors (v5 requirement)
- No direct state mutation — always use setter actions

## Where State Lives

```text
shared/src/store/     → Zustand slices shared across apps
apps/web/src/store/   → Web-only Zustand stores (if needed)
shared/src/hooks/     → queryOptions factories + TanStack Query wrappers
apps/web/src/hooks/   → Web-only query hooks (if needed)
```
