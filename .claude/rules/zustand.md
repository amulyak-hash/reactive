---
paths: shared/src/store/**/*.ts, apps/web/src/**/*.ts
---

# Zustand v5 Rules

## CRITICAL: Zustand v5 Breaking Changes

### 1. `useShallow` is REQUIRED for object/array selectors

In Zustand v5, selectors returning new references (objects, arrays) cause infinite re-render loops.
**ALWAYS** wrap object/array selectors with `useShallow`:

```typescript
// ❌ WRONG — causes infinite loop in v5
const { count, text } = useStore((state) => ({
  count: state.count,
  text: state.text,
}));

// ❌ WRONG — causes infinite loop in v5
const [searchValue, setSearchValue] = useStore((state) => [
  state.searchValue,
  state.setSearchValue,
]);

// ✅ CORRECT — useShallow returns stable reference
import { useShallow } from 'zustand/shallow';

const { count, text } = useStore(
  useShallow((state) => ({
    count: state.count,
    text: state.text,
  })),
);

// ✅ ALSO CORRECT — single primitive selector (no useShallow needed)
const count = useStore((state) => state.count);
```

### 2. TypeScript double-call syntax

v5 requires `create<Type>()(...)` — note the double parentheses:

```typescript
// ❌ WRONG — v4 syntax, breaks in v5 with TypeScript
const useStore = create<MyState>((set) => ({ ... }));

// ✅ CORRECT — v5 TypeScript syntax
const useStore = create<MyState>()((set) => ({ ... }));
```

## Mandatory Zustand Usage Principles

Use Zustand for:

- client-side shared UI state
- filters, search state
- modal/drawer state
- auth session
- lightweight cross-component state
- cached view state when appropriate

Do not use Zustand for:

- server data (use TanStack Query)
- local one-component-only state (use `useState`)
- uncontrolled form field state already owned by RHF
- duplicating backend response state

## Store Structure Requirements

Each store MUST define:

- state type (interface)
- actions type
- initial state
- typed selectors where useful
- no direct mutation
- no unrelated mixed concerns in one store

## Recommended Store File Pattern

```text
shared/src/store/
├── auth/
│   ├── authStore.ts        # Store definition
│   ├── types.ts            # State & action types
│   └── index.ts            # Barrel export
└── index.ts                # Root barrel
```

## Store Rules

- Keep stores focused by domain — prefer small stores over one giant global store
- Select only required slices — **ALWAYS** use `useShallow` for object/array selectors
- Single primitive selectors do NOT need `useShallow`
- Use derived selectors when repeated
- Persist state only when justified
- Async actions may call services, but UI components should not duplicate that logic

## Complete Example (v5 Correct)

```typescript
import { create } from 'zustand';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  setToken: (token: string | null) => void;
  logout: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()((set) => ({
  token: null,
  isAuthenticated: false,
  setToken: (token) => {
    set({ token, isAuthenticated: Boolean(token) });
  },
  logout: () => {
    set({ token: null, isAuthenticated: false });
  },
}));
```

### Consuming in a component

```typescript
import { useShallow } from 'zustand/shallow';
import { useAuthStore } from '@people-parley/shared';

const Component = () => {
  // ✅ Single primitive — no useShallow needed
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // ✅ Multiple values — useShallow required
  const { token, logout } = useAuthStore(
    useShallow((state) => ({
      token: state.token,
      logout: state.logout,
    })),
  );
};
```
