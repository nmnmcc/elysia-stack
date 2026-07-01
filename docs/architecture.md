# Architecture

This template is intentionally organized for long-lived products, not only for a small demo. The starter todo flow is a vertical slice that shows where future modules should grow.

## Principles

- **Thin composition, rich modules**: `packages/backend/src/app.ts` wires plugins and modules. Product behavior belongs in `src/modules/<module>/`.
- **NestJS-inspired backend discipline**: modules expose module factories, controllers own HTTP concerns, providers build injectable services, services own business rules, repositories own persistence, DTO files own contracts, and mappers own response shaping.
- **Vertical product slices**: backend modules and frontend features should own their controllers, services, repositories, API calls, query keys, hooks, and UI for one product capability.
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
│   │   ├── health.controller.ts
│   │   └── health.module.ts
│   └── todos/
│       ├── todos.controller.ts # Elysia routes and HTTP status mapping
│       ├── todos.dto.ts        # Request and response schemas
│       ├── todos.mapper.ts     # Database record to response mapping
│       ├── todos.module.ts     # Module factory registered by app.ts
│       ├── todos.providers.ts  # Module-local provider construction
│       ├── todos.repository.ts # Drizzle persistence functions
│       ├── todos.service.ts    # Business rules and authorization decisions
│       └── todos.types.ts      # Module-local TypeScript contracts
└── services/               # Stateful infrastructure integrations
    ├── auth/
    ├── config/
    ├── database/
    └── dependencies/
```

When adding `projects`, `billing`, `files`, or another product capability, create `src/modules/<module>/` first. Use the backend module standard in [`docs/backend-modules.md`](backend-modules.md). Keep route schemas close to the controller unless they are shared across modules. Put reusable cross-module contracts in `libraries/http`.

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
2. Add `<module>.module.ts` and `<module>.controller.ts`.
3. Add `<module>.providers.ts`, `<module>.service.ts`, `<module>.repository.ts`, `<module>.dto.ts`, `<module>.mapper.ts`, and `<module>.types.ts` when the module has business logic or persistence behavior.
4. Register the module factory in `packages/backend/src/app.ts`.
5. Add Drizzle schema under `services/database/schema/` and export it from `schema/index.ts`.
6. Add frontend code under `packages/frontend/src/features/<feature>/`.
7. Keep the route page under `app/` as a thin shell that renders the feature.
8. Run `task typecheck`, `task lint`, and `task build` before publishing.

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
