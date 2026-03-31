---
paths: shared/src/hooks/**/*.ts
---

# Shared Hook Rules (Cross-Platform)

## IMPORTANT: Platform Guard

All hooks in `shared/src/hooks/` must work on both web and React Native.

- **NEVER** import from `react-dom` or `react-native`
- **NEVER** import from `@mui/*` or any platform-specific UI library
- **ONLY** import from `react` core APIs

## Allowed Dependencies

Per the shared dependency graph:

```text
hooks/ → api-client/, store/, types/
```

No other shared folder imports allowed.

## Naming and Structure

- Naming: `use<Noun>` or `use<Action>` — follow React conventions
- One hook per file — file name matches hook name (e.g., `useAuth.ts`)
- Each hook has a co-located `*.spec.ts` test file
- Export from `shared/src/hooks/index.ts` barrel

## TanStack Query in Shared Hooks

Use `queryOptions()` factories for reusable, type-safe query configs:

```typescript
import { queryOptions } from '@tanstack/react-query';
import { getUsers } from '../api-client/users';

// queryOptions factory — usable by both web and mobile
export function usersQueryOptions(filters?: UserFilters) {
  return queryOptions({
    queryKey: ['users', filters],
    queryFn: () => getUsers(filters),
    staleTime: 5 * 60 * 1000,
  });
}
```

Apps then consume via `useQuery(usersQueryOptions(filters))` — the hook wrapper lives in the app, the options factory lives in shared.

## Zustand in Shared Hooks

```typescript
import { useAuthStore } from '../store/auth';

// Zustand actions are stable refs — no useCallback needed
export function useAuth() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  return { isAuthenticated, logout };
}
```

## Anti-patterns

- ❌ Importing `useNavigate` from `react-router` (web-only)
- ❌ Importing MUI hooks like `useTheme`, `useMediaQuery` (web-only)
- ❌ Using `window`, `document`, `navigator` (browser-only)
- ❌ Wrapping Zustand actions in `useCallback` (already stable refs)
