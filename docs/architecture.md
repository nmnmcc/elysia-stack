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
  -> module controller
  -> module service
  -> module repository
  -> PostgreSQL
```

The frontend imports the backend `App` type through Eden Treaty, so backend route schemas are the source of truth for internal API calls.

## Package Boundaries

```text
packages/
├── backend/   # Elysia API, auth, database, runtime services
└── frontend/  # Next.js app, route shells, product features
```

The backend owns persistence, authentication, authorization, and HTTP contracts. The frontend owns presentation, client state, URL state, and user workflows.

## Dependency Direction

```text
app.ts
  -> modules
  -> services
  -> libraries
```

`app.ts` composes application-level plugins and modules. Product modules may depend on backend services and shared libraries. Services must not import product modules. Libraries must stay framework-neutral unless their name clearly scopes them to a framework concern.

## Backend Layout

```text
packages/backend/src/
├── app.ts                  # Application composition and exported App type
├── index.ts                # Bun server entry point and shutdown lifecycle
├── libraries/              # Stateless cross-module helpers
│   ├── auth/               # Guards and auth helpers
│   └── http/               # Shared HTTP schemas and response helpers
├── modules/                # Product modules organized by capability
│   ├── health/
│   └── todos/
└── services/               # Stateful infrastructure integrations
    ├── auth/
    ├── config/
    ├── database/
    └── dependencies/
```

Backend modules follow the standard documented in [Backend Module Standard](backend-modules.md). In short: controllers own HTTP, services own business rules, repositories own persistence, DTOs own contracts, mappers own response shaping, and providers wire module-local dependencies.

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

Route files under `app/` should stay small. Product behavior belongs in `features/<feature>/`, with API calls, query keys, hooks, and feature-specific UI kept together.

## Runtime Dependencies

Application-wide dependencies are created in `services/dependencies`:

- `config`
- `pool`
- `database`
- `auth`

The dependency container is installed into Elysia context with a plugin. Modules receive the container through their module factory and create module-local providers from it. Tests can override dependencies with `createApp({ database, auth, config, pool })`.

## Request Flow

```text
HTTP request
  -> Elysia route
  -> controller
  -> guard
  -> service
  -> repository
  -> database
  -> mapper
  -> response
```

Authentication belongs in guards. Ownership and business authorization belong in services. HTTP status mapping belongs in controllers.

## Extension Path

When adding a capability:

1. Add the backend module under `packages/backend/src/modules/<feature>/`.
2. Add database schema under `packages/backend/src/services/database/schema/` when persistence is needed.
3. Register the backend module in `packages/backend/src/app.ts`.
4. Add the frontend feature under `packages/frontend/src/features/<feature>/`.
5. Add or update route shells under `packages/frontend/src/app/`.
6. Run the validation commands in [Development Workflow](development.md).
