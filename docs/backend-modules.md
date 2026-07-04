# Backend Module Standard

This document defines the backend module contract. It uses a small fixed feature-slice shape so modules are easy to create and review without copying NestJS boilerplate into an Elysia codebase.

## Purpose

Backend modules need a predictable shape so new capabilities can be added without debating file placement or responsibility boundaries. The standard answers three questions:

- Where does each kind of code go?
- How do dependencies enter a module?
- How does a request move from HTTP to business logic to persistence?

The default is intentionally three files. This keeps small modules small while still preventing route handlers from absorbing business rules and database access. API/domain schemas live in `@elysia-stack/schema` so contracts can be reused without importing backend implementation files.

## Module Shape

Each product module should start with this structure:

```text
src/modules/<feature>/
├── index.ts     # Elysia plugin, routes, imported schema binding, status mapping, module composition
├── service.ts   # Business rules and authorization decisions
└── data.ts      # Database access and persistence mapping
```

Small infrastructure modules may omit files they do not need. For example, the health module only needs `index.ts`.

Split extra files only when one of the three files becomes hard to scan or a type/schema is reused across modules. The split must preserve the same responsibilities instead of creating parallel conventions.

## Responsibility Model

```text
index
  -> service
  -> data
```

The module entry translates HTTP and composes module-local services. The service decides business behavior. The data file persists and maps database records.

### Module Entry

`index.ts` exports the factory registered by `src/app.ts`.

Allowed:

- Elysia plugin creation
- route paths and methods
- binding schemas imported from `@elysia-stack/schema`
- OpenAPI metadata
- guard calls
- module-local service and data construction
- mapping service results to HTTP statuses
- structured errors like `{ message }`

Not allowed:

- direct database queries
- ownership checks that belong to business rules
- defining API/domain schemas locally
- persistence mapping that belongs in `data.ts`

### Service

`service.ts` owns product behavior.

Allowed:

- workflow rules
- state transition rules
- authorization decisions after authentication identifies the user
- coordination between data objects or external services
- service input and result types when they are only used by the service boundary

Not allowed:

- Elysia `status(...)` responses
- request headers and cookies
- route schema definitions
- direct SQL or Drizzle query construction

### Data

`data.ts` owns persistence.

Allowed:

- `database.query.*` reads
- Drizzle insert, update, and delete mutations
- persistence-specific filtering and ordering
- database record types and persistence input types
- database record to domain/persistence mapping when needed

Not allowed:

- HTTP responses
- auth sessions
- request or cookie access
- business status names such as `forbidden`

## Request Flow

```text
HTTP request
  -> module route in index.ts
  -> guard
  -> service
  -> data
  -> database
  -> module response in index.ts
```

Authentication belongs in guards. Ownership and authorization decisions belong in services. HTTP status mapping belongs in `index.ts`.

## Schema Flow

```text
packages/schema
  -> module route in index.ts
  -> Eden Treaty App type
  -> frontend API calls
```

API and domain schemas belong in `packages/schema`. Schema values use PascalCase and share the same exported name as their TypeScript type, such as `Todo` and `CreateTodoBody`. Query schemas use `Query` as a leading verb, such as `QueryTodos`. Do not add `Schema` or `Dto` suffixes. The package is the shared contract layer; keeping schemas there avoids backend route files becoming the only source of reusable API shape.

Drizzle table schemas stay under `packages/backend/src/services/database/schema/`. They describe persistence shape and migration input, not public API contracts.

## Dependency Flow

```text
services/dependencies
  -> app.ts
  -> module factory
  -> module-local service/data instances
```

Application-wide dependencies are created once in `services/dependencies`. Module entries receive those dependencies and construct the small service/data graph they need. This keeps dependency wiring visible without requiring a provider file for every module.

## Adding a Product Module

1. Create `packages/backend/src/modules/<feature>/`.
2. Add API/domain schemas under `packages/schema/src/<feature>.ts`.
3. Add `index.ts` with the module factory, schema binding, routes, and status mapping.
4. Add `service.ts` when the module has business rules, authorization decisions, or workflow coordination.
5. Add `data.ts` when the module needs persistence.
6. Register the module in `packages/backend/src/app.ts`.
7. Add Drizzle schema under `services/database/schema/` when persistence is needed.
8. Add the matching frontend feature under `packages/frontend/src/features/<feature>/`.
9. Run the validation commands in [Development Workflow](development.md).

## Review Checklist

- `app.ts` only composes application-level plugins and modules.
- The module `index.ts` contains HTTP code but no persistence code.
- API/domain schemas are imported from `@elysia-stack/schema`, use PascalCase, and do not use `Schema` or `Dto` suffixes.
- Services contain business decisions but no Elysia `status(...)` calls.
- Data files contain database code but no auth, request, cookie, or HTTP status code.
- Shared helpers live under `libraries/`.
- Stateful integrations live under `services/`.
