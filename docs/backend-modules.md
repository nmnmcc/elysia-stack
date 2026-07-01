# Backend Module Standard

This document defines the backend module contract. It is intentionally close to NestJS in discipline while remaining Elysia-native in implementation.

## Purpose

Backend modules need a fixed shape so new capabilities can be added without debating file placement or responsibility boundaries. The standard answers three questions:

- Where does each kind of code go?
- How do dependencies enter a module?
- How does a request move from HTTP to business logic to persistence?

## Module Shape

Each product module should use this structure:

```text
src/modules/<feature>/
├── <feature>.module.ts       # Public module factory used by app.ts
├── <feature>.controller.ts   # Elysia routes, HTTP status mapping, DTO binding
├── <feature>.providers.ts    # Provider construction and Elysia decoration
├── <feature>.service.ts      # Business rules and authorization decisions
├── <feature>.repository.ts   # Database reads and writes
├── <feature>.dto.ts          # Request, response, params, and query schemas
├── <feature>.mapper.ts       # Database record to response mapping
└── <feature>.types.ts        # Module-local TypeScript contracts
```

Small infrastructure modules may omit files they do not need. For example, the health module only needs a module and controller.

## Responsibility Model

```text
module
  -> controller
  -> service
  -> repository
```

The module composes. The controller translates HTTP. The service decides business behavior. The repository persists data.

### Module

`<feature>.module.ts` exports the factory registered by `src/app.ts`.

Allowed:

- compose controller and providers
- receive application dependencies

Not allowed:

- route handlers
- business rules
- database access

### Controller

`<feature>.controller.ts` owns HTTP concerns.

Allowed:

- Elysia route paths and methods
- DTO binding
- OpenAPI metadata
- guard calls
- mapping service results to HTTP statuses
- structured errors like `{ message }`

Not allowed:

- direct database queries
- ownership checks that belong to business rules
- constructing repositories inside handlers

### Providers

`<feature>.providers.ts` creates module-local providers and decorates them onto the Elysia context.

This is the Elysia-stack equivalent of NestJS providers. Controllers should read providers from context, such as `todosService`, instead of constructing them per request.

### Service

`<feature>.service.ts` owns product behavior.

Allowed:

- workflow rules
- state transition rules
- authorization decisions after authentication identifies the user
- coordination between repositories or external services

Not allowed:

- Elysia `status(...)` responses
- request headers and cookies
- route schema definitions

### Repository

`<feature>.repository.ts` owns persistence.

Allowed:

- `database.query.*` reads
- Drizzle insert, update, and delete mutations
- persistence-specific filtering and ordering

Not allowed:

- HTTP responses
- auth sessions
- request or cookie access
- business status names such as `forbidden`

### DTO

`<feature>.dto.ts` owns HTTP schemas. Define params, query, body, and response schemas here with Elysia `t`.

### Mapper

`<feature>.mapper.ts` converts database records into response DTOs. Date serialization and internal-field removal belong here.

### Types

`<feature>.types.ts` owns module-local TypeScript contracts used by services, repositories, and mappers.

## Request Flow

```text
HTTP request
  -> controller
  -> guard
  -> service
  -> repository
  -> database
  -> mapper
  -> controller response
```

Authentication belongs in guards. Ownership and authorization decisions belong in services. HTTP status mapping belongs in controllers.

## Dependency Flow

```text
services/dependencies
  -> module
  -> providers
  -> controller context
```

Application-wide dependencies are created once in `services/dependencies`. Module providers convert those dependencies into module-local services and repositories.

## NestJS Mapping

```text
NestJS concept       Elysia-stack equivalent
Module               <feature>.module.ts
Controller           <feature>.controller.ts
Provider             <feature>.providers.ts + Elysia decorate
Service              <feature>.service.ts
Repository           <feature>.repository.ts
DTO                  <feature>.dto.ts
Guard                libraries/auth or module-local guard helper
Exception filter     controller status mapping with shared error DTOs
Pipe                 Elysia schema validation
Interceptor          Elysia plugin or library helper
```

## Adding a Product Module

1. Create `packages/backend/src/modules/<feature>/`.
2. Add `<feature>.module.ts` and `<feature>.controller.ts`.
3. Add `<feature>.providers.ts`, `<feature>.service.ts`, and `<feature>.repository.ts` when the module has business logic or persistence.
4. Add `<feature>.dto.ts` for every route contract.
5. Add `<feature>.mapper.ts` when response shape differs from database records.
6. Add `<feature>.types.ts` for module-local service and repository contracts.
7. Register the module in `packages/backend/src/app.ts`.
8. Add Drizzle schema under `services/database/schema/` when persistence is needed.
9. Add the matching frontend feature under `packages/frontend/src/features/<feature>/`.
10. Run the validation commands in [Development Workflow](development.md).

## Review Checklist

- `app.ts` only composes application-level plugins and modules.
- The module file only composes module pieces.
- Controllers contain HTTP code but no persistence code.
- Services contain business decisions but no Elysia `status(...)` calls.
- Repositories contain database code but no auth or request code.
- DTO schemas cover params, query, body, and responses.
- Providers decorate module-local services onto Elysia context.
- Shared helpers live under `libraries/`.
- Stateful integrations live under `services/`.
