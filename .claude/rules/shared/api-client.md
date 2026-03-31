---
paths: shared/src/api-client/**/*.ts
---

# API Client Rules

## Mandatory Axios Architecture

All API communication MUST go through reusable service modules in `shared/src/api-client/`.

UI components MUST NOT:

- instantiate Axios directly
- hardcode endpoints
- transform raw response shapes inline
- handle repeated auth/header setup

## Required Structure

```text
shared/src/api-client/
├── client.ts              # Central Axios instance
├── types.ts               # ApiError type, shared request/response types
├── users.ts               # User domain API functions
├── auth.ts                # Auth domain API functions
└── index.ts               # Barrel export
```

## Client Requirements

- Create and reuse a central Axios instance
- Configure: `baseURL` (from `shared/src/config/`), default headers, timeout
- Auth injection: callback-based — each app provides a `getToken()` function
- Error normalization: all API errors wrapped in a consistent `ApiError` type
- Type all request and response payloads
- IMPORTANT: no Zod schemas in api-client — validation belongs in `shared/src/validation/`

## Service Requirements

- One file per API domain or feature area
- Return typed domain-safe data
- Do not return raw `AxiosResponse` to components or hooks
- Allowed internal imports: `../types/`, `../config/` (type-only)

## Error Handling

- Do not silently swallow errors
- Convert transport/backend errors into app-usable typed error objects
- Prefer shared error parsers when available
- Components should render user-facing states, not decode Axios internals
