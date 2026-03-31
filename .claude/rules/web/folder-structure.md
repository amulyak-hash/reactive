---
paths: apps/web/src/**
---

# Web App Folder Structure

The web app (`apps/web/`) MUST follow this exact structure:

```text
apps/web/
├── public/
│   └── assets/
│       └── icons/                       # SVG icons only (kebab-case.svg)
│           ├── arrow-left.svg
│           ├── search.svg
│           └── close.svg
├── src/
│   ├── main.tsx                         # App entry point
│   ├── app/
│   │   ├── App.tsx                      # Root component with providers
│   │   ├── providers.tsx                # Provider composition
│   │   └── router.tsx                   # React Router config
│   │
│   ├── theme/                           # Theme folder
│   │   └── theme.ts                     # MUI theme tokens (consumes shared design tokens)
│   │
│   ├── components/                      # Reusable UI components (MUI wrappers + composed patterns)
│   │   ├── button/                      # MUI wrapper — generic name matching MUI primitive
│   │   │   ├── Button.tsx               # Component (PascalCase)
│   │   │   ├── styles.ts                # MUI styled() definitions
│   │   │   ├── types.ts                 # Component-specific types
│   │   │   ├── Button.stories.tsx       # Storybook stories
│   │   │   ├── Button.test.tsx          # Jest tests
│   │   │   └── index.ts                 # Barrel export
│   │   ├── card/                        # MUI wrapper — Card
│   │   ├── textField/                   # MUI wrapper — TextField
│   │   ├── statusBadge/                 # Composed pattern — no single MUI primitive
│   │
│   ├── pages/                           # Route-level screens
│   │   ├── home/                        # Page folder (camelCase)
│   │   │   ├── HomePage.tsx             # Page component (PascalCase + Page suffix)
│   │   │   ├── styles.ts                # Page-specific styles
│   │   │   ├── types.ts                 # Page-specific types
│   │   │   ├── HomePage.test.tsx        # Page tests (NO stories required)
│   │   │   └── index.ts                 # Barrel export
│   │
│   ├── hooks/                           # Custom React hooks (web-only)
│   │   ├── useAuth.ts                   # Hook (use + PascalCase)
│   │   ├── useAuth.test.ts              # Hook test
│   │   └── index.ts                     # Barrel export
│   │
│   ├── store/                           # Zustand stores (web-only UI state)
│   │   ├── auth/                        # Store domain (camelCase)
│   │   │   ├── authStore.ts             # Store definition (domainStore.ts)
│   │   │   ├── types.ts                 # State & action types
│   │   │   └── index.ts                 # Barrel export
│   │   └── index.ts                     # Root barrel export
│   │
│   ├── utils/                           # Pure helper functions (web-only)
│   │   ├── validators.ts
│   │   └── index.ts
│   │
│   ├── types/                           # Shared domain types (web-only)
│   │   ├── common.types.ts
│   │   └── index.ts
│   │
│   ├── constants/                       # Application constants (web-only)
│   │   ├── routes.constants.ts          # Route paths (ROUTES object)
│   │   ├── validation.constants.ts
│   │   └── index.ts
│   │
│   ├── assets/                          # Static files: images, SVGs, fonts
│   ├── mocks/                           # MSW browser worker setup (dev only)
│   │   └── browser.ts
│   └── styles/                          # Global styles
│       └── global.css
│
├── .env.example
├── tsconfig.json
└── vite.config.ts
```

> **Monorepo note**: utils, types, constants, hooks, store, and services that are reused across web and mobile belong in `shared/src/` — not here. Only web-exclusive code lives in `apps/web/src/`.

---

## Component Contract

For every new reusable UI component, all required files MUST exist:

```text
componentName/
├── ComponentName.tsx
├── styles.ts
├── types.ts
├── ComponentName.stories.tsx
├── ComponentName.test.tsx
└── index.ts
```

**Missing any file = incomplete component.**

Every component's `types.ts` MUST include `'data-testid'?: string` in the props interface, and the component MUST forward it to its root element. See `execution-flow.md` § Reusable component `data-testid` pattern.

Pages require `styles.ts`, `types.ts`, `PageName.test.tsx`, and `index.ts` — but NO stories.

---

## Naming Rules

- **Folders**: `camelCase` (e.g., `decisionRooms/`, `jobCard/`)
- **Components**: `PascalCase.tsx` (e.g., `PostCard.tsx`)
- **Stories**: `ComponentName.stories.tsx`
- **Tests**: `ComponentName.test.tsx`
- **Types file**: `types.ts`
- **Styles file**: `styles.ts`
- **Variables and functions**: `camelCase`
- **Constants**: `CONSTANT_CASE` for constant values

### Naming Intent Rule

**MUI wrapper components** use generic names matching the MUI primitive they wrap (e.g., `Button`, `Card`, `TextField`, `Dialog`). These live in `components/` and serve as the app's standardized MUI wrappers.

**Page-specific and business components** must reflect business intent, responsibility, and behavior. **Never use generic labels for these.**

- ❌ `pages/home/HomePage.tsx` for a job listing page
- ✅ `pages/jobDirectory/JobDirectoryPage.tsx`
- ❌ `components/card/Card.tsx` for a job-posting-specific card (that's not a generic MUI wrapper)
- ✅ `components/jobCard/JobCard.tsx` for a business-specific card

Derive business component names from the Figma frame name, feature content, or business purpose.

### State / Role Variant Naming

When a component has multiple access-level or state variants, encode the variant in the name:

```
VendorDetailSubscribed.tsx             ← subscriber view
VendorDetailUnsubscribedOwner.tsx      ← owner (unsubscribed) view
VendorDetailUnsubscribedPublic.tsx     ← public (unsubscribed) view

ServiceVendorProfileFull.tsx           ← profile with content
ServiceVendorProfileEmpty.tsx          ← empty / new profile state
```

### Component Suffix Conventions

| Suffix    | When to use                              | Example                    |
| --------- | ---------------------------------------- | -------------------------- |
| `Screen`  | Full-screen view (auth flow, onboarding) | `RoleSelectionScreen.tsx`  |
| `Page`    | Route-level page component               | `SettingsPage.tsx`         |
| `Step`    | One step in a multi-step flow            | `OTPVerificationStep.tsx`  |
| `Modal`   | Dialog / overlay                         | `CreatePostModal.tsx`      |
| `Card`    | Feed or list item                        | `ArticlePostCard.tsx`      |
| `Panel`   | Side panel                               | `MessagingPanel.tsx`       |
| `View`    | Detail view rendered inline (no modal)   | `CollectionDetailView.tsx` |
| `Detail`  | Full detail view (page-level)            | `DecisionRoomDetail.tsx`   |
| `Overlay` | Floating overlay UI                      | `WelcomeTourOverlay.tsx`   |
| `Nudge`   | Prompt or call-to-action banner          | `FirstActionNudge.tsx`     |

---

## Mock API Contract Rule

Services must return mocked API responses that mirror real backend contracts. Responses must be typed and follow a real-world API shape:

```ts
{
  status: number;
  data: T;
  message: string;
  error?: string;
}
```

---

## Component Extraction During Page Building (MANDATORY)

When building any page, **proactively identify generic UI elements** that can be reused across the web app and extract them as MUI wrapper components into `apps/web/src/components/`.

### What to extract

Look for UI patterns that wrap or configure MUI primitives with app-specific defaults:

- **Layout wrappers** — e.g., `PageContainer`, `SectionHeader`, `ContentCard`
- **Data display** — e.g., `StatusBadge`, `InfoRow`, `StatCard`, `EmptyState`
- **Action patterns** — e.g., `ActionBar`, `ConfirmDialog`, `SearchInput`
- **Navigation** — e.g., `NavTab`, `BreadcrumbBar`, `BackButton`
- **Feedback** — e.g., `LoadingOverlay`, `ErrorBanner`, `SuccessToast`

### Rules

- Extract **before** duplicating — if a UI element appears generic, create a component immediately rather than inlining it in the page
- Each extracted component MUST follow the full component contract (`ComponentName.tsx`, `styles.ts`, `types.ts`, `index.ts`, `.stories.tsx`, `.test.tsx`)
- Components should wrap MUI primitives via `styled()` — not replace them
- Keep components focused: one responsibility per component
- Name components generically after the MUI primitive they wrap (e.g., `Button` for MUI `Button` wrapper, `Card` for MUI `Card` wrapper, `TextField` for MUI `TextField` wrapper). For composed patterns that don't map to a single MUI primitive, use a descriptive generic name (e.g., `StatusBadge`, `InfoRow`, `ActionBar`)
- Page files should compose these components — pages should read as orchestration, not contain raw styling

---

## Anti-patterns

- **NEVER** import from one feature folder into another — extract shared pieces to `components/` or `shared/`
- **NEVER** create a flat `.tsx` file directly in `components/` — every component lives in its own named folder
- **NEVER** name folders generically (`common/`, `misc/`, `helpers/`) — use a specific business-purpose name
- **NEVER** put route definitions inside page or feature components — all routes in `app/router.tsx`
- **NEVER** co-locate mock data with components — mocks live in `mocks/` or `shared/src/mocking/`
- **NEVER** put cross-platform utils/types/hooks inside `apps/web/src/` — those belong in `shared/src/`
- **NEVER** call `shared/src/api-client/` directly from a component — go through `services/` then a hook
