# Architecture and Directory Rules

## Mandatory Separation of Concerns

**This separation is REQUIRED across the entire monorepo.**

- **Components** (app-local) = atomic UI units and composed UI blocks only
- **Pages** (app-local) = screen composition only
- **Store** (shared or app-local) = client state only (Zustand)
- **API Client** (shared) = HTTP transport and typed request wrappers only
- **Hooks** (shared or app-local) = reusable UI/state orchestration only
- **Utils** (shared) = pure reusable helpers only
- **Types** (shared) = TypeScript interfaces, enums, DTOs only
- **Validation** (shared) = Zod schemas only
- **Design Tokens** (shared) = platform-agnostic visual constants only
- **Config** (shared) = environment-specific values only
- **Constants** (shared) = environment-independent values only

## Monorepo Layer Rules

| Layer                | Location                    | Rules                                               |
| -------------------- | --------------------------- | --------------------------------------------------- |
| Shared types         | `shared/src/types/`         | No runtime logic, no Zod schemas                    |
| Shared validation    | `shared/src/validation/`    | Zod schemas only, no API calls                      |
| Shared api-client    | `shared/src/api-client/`    | No JSX, no UI logic, no platform imports            |
| Shared store         | `shared/src/store/`         | No JSX, Zustand only, client state only             |
| Shared hooks         | `shared/src/hooks/`         | Cross-platform only — no react-dom or react-native  |
| Shared utils         | `shared/src/utils/`         | Pure functions only — no framework coupling         |
| Shared design-tokens | `shared/src/design-tokens/` | Plain TS constants — no MUI, no Emotion, no RN      |
| Shared config        | `shared/src/config/`        | Env-specific values — no hardcoded constants        |
| Shared constants     | `shared/src/constants/`     | Hardcoded values — nothing from `.env`              |
| Shared mocking       | `shared/src/mocking/`       | MSW handlers + faker — never imported in production |
| Web components       | `apps/web/src/components/`  | MUI components, styled(), theme consumption         |
| Web pages            | `apps/web/src/pages/`       | Route-level screens, layout composition             |
| Web theme            | `apps/web/src/theme/`       | MUI `createTheme()` mapping design tokens           |
| Mobile app           | `apps/mobile/src/`          | React Native components (placeholder)               |

## Import Direction Rules

```text
apps/web/    → shared/     ✅ (app consumes shared)
apps/mobile/ → shared/     ✅ (app consumes shared)
shared/      → apps/*      ❌ NEVER (shared cannot import from apps)
apps/web/    → apps/mobile/ ❌ NEVER (no cross-app imports)
apps/mobile/ → apps/web/    ❌ NEVER (no cross-app imports)
```
