# Frontend Feature Standard

This document defines the frontend feature contract. It gives Next.js route files, feature code, client state, server state, and shared UI a predictable place to live.

## Purpose

Frontend features need a fixed shape so product workflows can grow without turning route files into mixed UI, data, and state containers. The standard answers four questions:

- What belongs in `app/` and what belongs in `features/`?
- Where do Eden Treaty calls live?
- Where do TanStack Query keys and mutations live?
- When should a component be client-side?

## Feature Shape

Each product feature should use this structure:

```text
src/features/<feature>/
├── api.ts              # Eden Treaty calls and API error handling
├── query-keys.ts       # TanStack Query key factory
├── hooks/              # Feature hooks, queries, mutations, and URL state hooks
├── components/         # Feature-specific UI components
├── forms/              # Feature-specific form components when forms become large
├── types.ts            # Feature-local TypeScript contracts when needed
└── utils.ts            # Feature-local pure helpers when needed
```

Only create optional files and folders when the feature needs them. Small features can start with `api.ts`, `query-keys.ts`, `hooks/`, and `components/`.

## Responsibility Model

```text
app route
  -> feature component
  -> feature hook
  -> feature api
  -> Eden Treaty client
  -> backend
```

Route files compose. Feature components render workflows. Hooks coordinate state. API files call the backend. Shared `lib/` code provides clients and small cross-feature helpers.

## Route Files

`src/app/` owns routing, layouts, metadata, and thin page shells.

Allowed:

- route segments
- layouts
- metadata
- server component composition
- `page.tsx` to `content.tsx` splits for URL-state pages
- `SectionBoundary` wrappers for `nuqs` pages

Not allowed:

- long product workflows
- TanStack Query mutation definitions
- Eden Treaty request code
- feature-specific reusable UI

## Feature Components

`features/<feature>/components/` owns UI that belongs to one product capability.

Allowed:

- workflow-specific panels and lists
- feature-specific empty, loading, and error states
- event handlers that call feature hooks
- composition of shared UI components

Not allowed:

- cross-feature components
- global providers
- generated registry components
- direct backend client setup

Move reusable cross-feature UI to `src/components/`. Keep generated registry components in `src/components/ui/` and do not edit them manually.

## API Layer

`features/<feature>/api.ts` owns Eden Treaty calls for the feature.

Allowed:

- calling `api` from `src/lib/api-client.ts`
- translating Eden `{ data, error }` results into thrown errors or returned data
- small request input shaping

Not allowed:

- React hooks
- TanStack Query keys
- UI state
- direct `fetch` for internal backend routes

Internal API calls should use Eden Treaty so frontend code stays tied to the backend `App` type.

## Query Keys

`features/<feature>/query-keys.ts` owns query key factories.

Query keys should be stable, hierarchical, and feature-scoped:

```ts
export const projectQueryKeys = {
  all: () => ["projects"],
  list: (filters: ProjectFilters) => ["projects", "list", filters],
  detail: (id: string) => ["projects", "detail", id],
};
```

Mutations should invalidate the narrowest correct key. Invalidate the feature root only when a mutation can affect multiple lists or summaries.

## Hooks

`features/<feature>/hooks/` owns feature-specific hooks.

Allowed:

- `useQuery`
- `useMutation`
- query invalidation
- optimistic updates when needed
- `nuqs` URL state hooks for the feature
- browser-only state that belongs to the feature

Not allowed:

- route metadata
- generic hooks that are useful across unrelated features
- direct DOM manipulation unless a browser API requires it

Move truly shared hooks to `src/hooks/`.

## Server And Client Components

Prefer server components by default. Add `"use client"` only when a file needs:

- React state or effects
- browser APIs
- TanStack Query hooks
- better-auth client hooks
- `nuqs` hooks
- event handlers

For pages that use `nuqs`, split the route into:

```text
page.tsx      # server entry
content.tsx   # client content wrapped with SectionBoundary
```

## URL State

Use `nuqs` for URL search params. Do not parse `window.location` manually. Feature-specific URL state helpers should live under `features/<feature>/hooks/`.

## Adding A Frontend Feature

1. Create `packages/frontend/src/features/<feature>/`.
2. Add `api.ts` for Eden Treaty calls.
3. Add `query-keys.ts` when the feature reads server state.
4. Add hooks under `hooks/` for queries, mutations, invalidation, and URL state.
5. Add feature UI under `components/`.
6. Add or update route shells under `packages/frontend/src/app/`.
7. Keep generated UI changes inside the registry workflow; do not hand-edit `components/ui/`.
8. Run the validation commands in [Development Workflow](development.md).

## Review Checklist

- Route files are thin and mostly compose feature components.
- Internal API calls use Eden Treaty through the feature API layer.
- Query keys are centralized in `query-keys.ts`.
- Mutations invalidate the correct query keys.
- Client components are marked with `"use client"` only when needed.
- URL search params use `nuqs`.
- Feature-specific UI stays inside `features/<feature>/components/`.
- Shared UI is moved to `components/`.
- Generated UI files in `components/ui/` are not edited manually.
