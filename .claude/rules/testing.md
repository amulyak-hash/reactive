---
paths: apps/web/src/**/*.test.ts, apps/web/src/**/*.test.tsx, apps/web/src/**/*.spec.ts, apps/web/src/**/*.spec.tsx, shared/src/**/*.test.ts, shared/src/**/*.spec.ts, apps/mobile/src/**/*.test.ts, apps/mobile/src/**/*.test.tsx
---

# Testing Rules

IMPORTANT: test runner is **Jest** for ALL packages. **NEVER use Vitest.**

## Platform-Specific Testing

| Package | Library                         | Environment              |
| ------- | ------------------------------- | ------------------------ |
| Web     | `@testing-library/react`        | `jest-environment-jsdom` |
| Mobile  | `@testing-library/react-native` | default (node)           |
| Shared  | Jest                            | default (node)           |

IMPORTANT: do NOT use MSW Node interceptor. Use direct jest mocks/spies in tests.

## Required Coverage Per Component

- renders correctly with default props
- renders variants and states
- handles user interactions
- supports keyboard interaction
- includes accessibility assertions
- handles edge cases and error states

## Required Render Setup (Web)

```typescript
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { theme } from '../theme';

// Always wrap with ThemeProvider for web component tests
```

## Test Conventions

- File naming: `*.spec.ts(x)` or `*.test.ts(x)` — both recognized by Nx
- Test co-location: test files live next to the source file they test
- Prefer `userEvent` over `fireEvent` for web interaction tests
- Test behavior and output, never implementation details
- Run all: `pnpm test`. Single package: `nx test <package-name>`

## Store Tests (Zustand)

- Reset store state between tests
- Do not leak state across test cases
- Test selector-driven UI updates

## API/Service Tests

- Mock service layer or network boundary consistently
- Do not hit real endpoints
- Verify success, loading, and failure behaviors

## Hook Tests

- Test observable behavior, not implementation details
- Verify async transitions explicitly
