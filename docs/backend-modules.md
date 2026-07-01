# Backend Module Standard

The backend follows a NestJS-inspired module standard while staying Elysia-native. The goal is predictable placement, explicit dependency flow, and routes that remain type-safe for Eden Treaty.

## File Contract

Each product module should use this shape:

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

Small infrastructure modules, such as health checks, may omit provider, service, repository, mapper, and types files when they do not need them.

## Responsibility Boundaries

### Module

`<feature>.module.ts` exports the function registered by `src/app.ts`.

It should only compose the module. It should not contain route handlers, business rules, or persistence logic.

### Controller

`<feature>.controller.ts` owns HTTP concerns:

- Elysia route paths and methods
- DTO binding through Elysia schemas
- OpenAPI metadata
- calling guards
- mapping service results to HTTP status codes
- returning structured errors like `{ message }`

Controllers should not query the database directly.

### Providers

`<feature>.providers.ts` creates module providers and decorates them onto the Elysia context.

This is the Elysia equivalent of NestJS providers. Controllers should read module providers from context, for example `todosService`, instead of constructing them inside route handlers.

### Service

`<feature>.service.ts` owns product behavior:

- authorization decisions after authentication has identified the user
- workflow rules
- state transition rules
- coordination between repositories or external services

Services should return domain results, not Elysia `status(...)` responses.

### Repository

`<feature>.repository.ts` owns persistence.

- Use `database.query.*` for reads when possible.
- Use Drizzle insert/update/delete builders for mutations.
- Do not return HTTP responses from repositories.
- Do not access request headers, cookies, or auth sessions here.

### DTO

`<feature>.dto.ts` owns HTTP schemas.

Use Elysia `t` schemas for params, query, body, and response models. Keep schemas close to the controller unless another module genuinely shares them.

### Mapper

`<feature>.mapper.ts` converts database records into response DTOs. Date serialization, internal-field removal, and response shape normalization belong here.

### Types

`<feature>.types.ts` owns module-local TypeScript contracts used by service, repository, and mapper code.

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

Authentication belongs in guards. Ownership and business authorization belong in services. HTTP status mapping belongs in controllers.

## Dependency Flow

```text
services/dependencies
  -> module
  -> providers
  -> controller context
```

`services/dependencies` creates application-wide dependencies such as config, database, auth, and pool. Module providers create module-local services and repositories from those dependencies.

## NestJS Mapping

```text
NestJS concept       Elysia-stack equivalent
Module               <feature>.module.ts
Controller           <feature>.controller.ts
Provider             <feature>.providers.ts + Elysia decorate
Service              <feature>.service.ts
Repository           <feature>.repository.ts
DTO                  <feature>.dto.ts
Guard                libraries/auth or module-local guard helpers
Exception filter     controller status mapping with shared error DTOs
Pipe                 Elysia schema validation
Interceptor          Elysia plugin or library helper
```

## Adding a Product Module

1. Create `src/modules/<feature>/`.
2. Add `<feature>.module.ts` and `<feature>.controller.ts`.
3. Add `<feature>.providers.ts`, `<feature>.service.ts`, and `<feature>.repository.ts` if the module has business logic or persistence.
4. Add `<feature>.dto.ts` for every route contract.
5. Add `<feature>.mapper.ts` when response shape differs from database records.
6. Add `<feature>.types.ts` for module-local service/repository contracts.
7. Register the module in `src/app.ts`.
8. Add Drizzle schema under `services/database/schema/` when persistence is needed.
9. Add the matching frontend feature under `packages/frontend/src/features/<feature>/`.
10. Run format, typecheck, lint, and build.

## Review Checklist

- `app.ts` only composes application-level plugins and modules.
- Controllers contain HTTP code but no persistence code.
- Services contain business decisions but no Elysia `status(...)` calls.
- Repositories contain database code but no auth or request code.
- DTO schemas cover params, query, body, and responses.
- Providers decorate services onto Elysia context.
- Shared helpers live under `libraries/`, not inside unrelated modules.
- Stateful integrations live under `services/`.
