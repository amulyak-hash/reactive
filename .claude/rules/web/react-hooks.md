---
paths: apps/web/src/**/*.tsx, apps/web/src/**/*.ts
---

# React 19 Component and Hook Rules (Web App)

## React 19 New APIs

### `useActionState` — form action state management

```typescript
import { useActionState } from 'react';

function LoginForm() {
  const [state, submitAction, isPending] = useActionState(async (previousState, formData) => {
    const result = await login(formData);
    return result;
  }, null);

  return (
    <form action={submitAction}>
      <TextField name="email" label="Email" disabled={isPending} />
      <Button type="submit" loading={isPending}>
        Log in
      </Button>
      {state?.error && <Typography color="error">{state.error}</Typography>}
    </form>
  );
}
```

### `use()` — read resources in render

```typescript
import { use } from 'react';

function UserProfile({ userPromise }) {
  const user = use(userPromise); // suspends until resolved
  return <Typography>{user.name}</Typography>;
}
```

## Component Responsibilities

### Presentational Components

- receive props
- render UI
- contain minimal local UI behavior only
- do not fetch data directly
- do not own shared business state

### Container or Feature Orchestration Components

- may consume hooks, stores, services through hooks
- prepare data and handlers for presentational children
- remain thin and readable

## Web Hook Patterns

App-local hooks go in `apps/web/src/hooks/`.

Hooks may coordinate:

- TanStack Query (`queryOptions` + `useQuery`/`useSuspenseQuery`/`useMutation`)
- Zustand selectors/actions (with `useShallow` for object/array selectors)
- React Router navigation (`useNavigate`, `useParams`)
- React Hook Form wiring
- memoized transformations

Hooks MUST NOT:

- render JSX
- hide critical side effects unexpectedly
- return unstable anonymous structures when avoidable
- duplicate store/service behavior already implemented elsewhere

## Example: Hook using TanStack Query queryOptions

```typescript
import { useQuery, queryOptions } from '@tanstack/react-query';
import { getUser } from '@people-parley/shared';

export function userQueryOptions(userId: string) {
  return queryOptions({
    queryKey: ['users', userId],
    queryFn: () => getUser(userId),
  });
}

export function useUser(userId: string) {
  return useQuery(userQueryOptions(userId));
}
```

## Example: Hook coordinating store + service

```typescript
import { useCallback } from 'react';

import { useUserStore } from '@people-parley/shared';
import { getUser } from '@/services/user/userService';
import type { UserModel } from '@/services/user/types';

interface UseUserResult {
  user: UserModel | null;
  isLoading: boolean;
  fetchUser: (id: string) => Promise<void>;
}

export const useUser = (): UseUserResult => {
  const user = useUserStore((state) => state.user);
  const isLoading = useUserStore((state) => state.isLoading);
  const setUser = useUserStore((state) => state.setUser);
  const setLoading = useUserStore((state) => state.setLoading);

  const fetchUser = useCallback(
    async (id: string): Promise<void> => {
      setLoading(true);
      const data = await getUser(id);
      setUser(data);
      setLoading(false);
    },
    [setUser, setLoading],
  );

  return { user, isLoading, fetchUser };
};
```

## Example: Hook coordinating Zustand store (selector-only)

```typescript
import { useAuthStore } from '@people-parley/shared';

// Zustand actions are stable refs — no useCallback needed
export function useAuth() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const login = useAuthStore((state) => state.setToken);
  const logout = useAuthStore((state) => state.logout);

  return { isAuthenticated, login, logout };
}
```

## Wrong: Hook that duplicates store logic

```typescript
// ❌ BAD — duplicates store state and uses raw Axios directly
export const useUser = () => {
  const [user, setUser] = useState(null); // duplicates store state
  useEffect(() => {
    axios.get('/users/1').then((r) => setUser(r.data)); // raw Axios in hook
  }, []);
  return user;
};
```
