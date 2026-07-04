# Architecture

This document explains the shape of the system. It starts with the product-level goal, then narrows into package boundaries, dependency direction, backend layout, frontend layout, and runtime flow.

## Goal

`elysia-stack` is a full-stack TypeScript template for products that are expected to grow beyond a demo. The architecture is optimized for:

- predictable module placement
- type-safe API contracts
- dependency injection without global state
- feature-oriented frontend growth
- deployment parity between development and production

## System Map

```text
User
  -> Next.js frontend
  -> Eden Treaty client
  -> Elysia backend
  -> module route
  -> module service
  -> module data
  -> PostgreSQL
```

The frontend imports the backend `App` type through Eden Treaty, so backend route schemas are the source of truth for internal API calls.

## Package Boundaries

```text
packages/
├── backend/   # Elysia API, auth, database, runtime services
├── frontend/  # Next.js app, route shells, product features
└── schema/    # Shared API and domain schemas
```

The schema package owns reusable API and domain contracts. The backend owns persistence, authentication, authorization, and route implementation. The frontend owns presentation, client state, URL state, and user workflows.

## Dependency Direction

```text
app.ts
  -> modules
  -> schema
  -> services
  -> libraries
```

`app.ts` composes application-level plugins and modules. Product modules may depend on shared schemas, backend services, and shared libraries. Services must not import product modules. Libraries must stay framework-neutral unless their name clearly scopes them to a framework concern.

## Backend Layout

```text
packages/backend/src/
├── app.ts                  # Application composition and exported App type
├── index.ts                # Bun server entry point and shutdown lifecycle
├── libraries/              # Stateless cross-module helpers
│   └── auth/               # Guards and auth helpers
├── modules/                # Product modules organized by capability
│   ├── health/
│   └── todos/
└── services/               # Stateful infrastructure integrations
    ├── auth/
    ├── config/
    ├── database/
    └── dependencies/
```

Backend modules follow the standard documented in [Backend Module Standard](backend-modules.md). In short: `index.ts` owns HTTP routes and module composition, `service.ts` owns business rules, and `data.ts` owns persistence. API/domain schemas come from `@elysia-stack/schema`. The three-file default keeps modules predictable without forcing unused boilerplate into small features.

## Schema Layout

```text
packages/schema/src/
├── http.ts    # Shared HTTP response schemas
├── index.ts   # Public schema exports
└── todos.ts   # Todo API/domain schemas
```

Schema values use PascalCase and share the same exported name as their TypeScript type, such as `Todo` and `CreateTodoBody`. Query schemas use `Query` as a leading verb, such as `QueryTodos`. They do not use `Schema` or `Dto` suffixes. Drizzle table schemas remain in the backend database service because they describe persistence and migrations.

## Frontend Layout

```text
packages/frontend/src/
├── app/          # Next.js routing, layouts, and thin page shells
├── components/   # Shared app components
│   └── ui/       # Generated registry components
├── features/     # Product features organized by capability
├── hooks/        # Truly shared React hooks
└── lib/          # Clients, config helpers, and small utilities
```

Frontend features follow the standard documented in [Frontend Feature Standard](frontend-features.md). In short: route files compose, feature components render workflows, hooks coordinate state, API files call Eden Treaty, and query key factories centralize TanStack Query cache identity.

## Runtime Dependencies

Application-wide dependencies are created in `services/dependencies`:

- `config`
- `pool`
- `database`
- `auth`

The dependency container is installed into Elysia context with a plugin. Modules receive the container through their module factory and create module-local service/data instances from it. Tests can override dependencies with `createApp({ database, auth, config, pool })`.

## Request Flow

```text
HTTP request
  -> Elysia route
  -> module route
  -> guard
  -> service
  -> data
  -> database
  -> response
```

Authentication belongs in guards. Ownership and business authorization belong in services. HTTP status mapping belongs in module routes.

## Extension Path

When adding a capability:

1. Add the backend module under `packages/backend/src/modules/<feature>/`.
2. Add API/domain schemas under `packages/schema/src/<feature>.ts`.
3. Add database schema under `packages/backend/src/services/database/schema/` when persistence is needed.
4. Register the backend module in `packages/backend/src/app.ts`.
5. Add the frontend feature under `packages/frontend/src/features/<feature>/`.
6. Add or update route shells under `packages/frontend/src/app/`.
7. Run the validation commands in [Development Workflow](development.md).
