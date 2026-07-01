# Architecture

This template is intentionally organized for long-lived products, not only for a small demo. The starter todo flow is a vertical slice that shows where future modules should grow.

## Principles

- **Thin composition, rich modules**: `packages/backend/src/app.ts` wires plugins and modules. Product behavior belongs in `src/modules/<module>/`.
- **Vertical product slices**: backend modules and frontend features should own their route handlers, API calls, query keys, hooks, and UI for one product capability.
- **Horizontal infrastructure**: shared external integrations belong in backend `services/`; framework-neutral helpers belong in backend `libraries/`.
- **Typed boundaries**: Elysia schemas define HTTP contracts, Drizzle owns database shape, and Eden Treaty keeps the frontend tied to the exported backend `App` type.
- **Replaceable dependencies**: runtime dependencies are created in `services/dependencies` and injected into Elysia so tests and future adapters can override them.

## Backend Layout

```text
packages/backend/src/
├── app.ts                  # Application composition, OpenAPI, CORS, module registration
├── index.ts                # Bun server entry point and shutdown lifecycle
├── libraries/              # Stateless cross-module helpers
│   ├── auth/               # Session and auth helper functions
│   └── http/               # Shared HTTP schemas and response helpers
├── modules/                # Product modules, organized by capability
│   ├── health/
│   │   └── routes.ts
│   └── todos/
│       ├── models.ts       # Route schemas, DTO mapping, module input types
│       ├── repository.ts   # Drizzle persistence functions
│       └── routes.ts       # Elysia route factory
└── services/               # Stateful infrastructure integrations
    ├── auth/
    ├── config/
    ├── database/
    └── dependencies/
```

When adding `projects`, `billing`, `files`, or another product capability, create `src/modules/<module>/` first. Keep route schemas close to the route unless they are shared across modules. Put reusable cross-module contracts in `libraries/http`.

Data reads should prefer Drizzle Queries API through `database.query.*`. Mutations can use Drizzle's insert/update/delete builders because the Queries API is read-focused.

## Frontend Layout

```text
packages/frontend/src/
├── app/                    # Next.js routing, layouts, and page shells
├── components/             # Shared app components
│   └── ui/                 # Generated registry components
├── features/               # Product features, organized by capability
│   └── todos/
│       ├── api.ts          # Eden Treaty calls
│       ├── query-keys.ts   # TanStack Query key factory
│       ├── hooks/          # Feature hooks and mutations
│       └── components/     # Feature-specific UI
├── hooks/                  # Truly shared hooks
└── lib/                    # Clients, config helpers, and small utilities
```

Route files under `app/` should stay small. If a page starts to contain product behavior, move that behavior into a feature and import the feature component back into the page.

Every server state feature should define query keys in one place and use TanStack Query invalidation after mutations. Eden Treaty remains the default transport for internal API calls.

## Adding a Module

1. Create `packages/backend/src/modules/<module>/`.
2. Add `models.ts`, `repository.ts`, and `routes.ts` when the module has HTTP and persistence behavior.
3. Register the route factory in `packages/backend/src/app.ts`.
4. Add Drizzle schema under `services/database/schema/` and export it from `schema/index.ts`.
5. Add frontend code under `packages/frontend/src/features/<feature>/`.
6. Keep the route page under `app/` as a thin shell that renders the feature.
7. Run `task typecheck`, `task lint`, and `task build` before publishing.

## Dependency Injection

`services/dependencies` creates the runtime container:

- `config`
- `pool`
- `database`
- `auth`

Modules receive the dependency container through their route factory and install it with the Elysia dependency plugin. Route handlers read injected services from Elysia context. Tests can override dependencies with `createApp({ database, auth, config, pool })`.

## Development Standards

- Avoid type assertions; prefer types that express the constraint directly.
- Keep generated code in clearly documented folders.
- Do not hide product behavior in global utilities.
- Promote duplicated behavior only after at least two modules need it.
- Update `AGENTS.md` and this document whenever a new boundary or convention is introduced.
