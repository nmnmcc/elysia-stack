# AGENTS.md

> This file contains project instructions for AI coding assistants. `CLAUDE.md` is a symlink to it.

## Code Style

- **No `as` type assertions** unless the type system genuinely cannot express the constraint.
- **Prefer Drizzle Queries API** (`database.query.*`) over query builder (`database.select().from()...`).
- **No conditional spread for optional properties** — use `key: x ?? undefined` instead of `...(x ? { key: x } : {})`.
- **`database` is always spelled out**, never abbreviated to `db`.
- **`index.ts` may contain implementation code**, not just re-exports. Files within the same directory must not import from the directory's own `index.ts`.
- **Boolean variables** must use `is`/`has`/`should`/`can` prefixes or adjective/past-participle forms.
- **Prefer `export * from "..."`** in barrel files over listing individual exports.

## Backend (`packages/backend/`)

- Run the Elysia server with Bun in development and production.
- Keep runtime configuration in `services/config/index.ts`.
- Wire backend services through `services/dependencies/index.ts`; route handlers should read injected services from Elysia context.
- Export the Elysia `App` type from `src/app.ts` so Eden Treaty clients stay type-safe.
- Keep `src/app.ts` as application composition only. Put domain code under `src/modules/<module>/`.
- Backend modules follow a NestJS-inspired contract: `<module>.module.ts`, `<module>.controller.ts`, `<module>.providers.ts`, `<module>.service.ts`, `<module>.repository.ts`, `<module>.dto.ts`, `<module>.mapper.ts`, and `<module>.types.ts` as needed.
- Controllers own HTTP routing, DTO binding, OpenAPI metadata, guard calls, and status mapping. They must not query the database directly.
- Services own business rules and authorization decisions. They must not return Elysia `status(...)` responses.
- Repositories own persistence and must not access request, auth, cookie, or HTTP status APIs.
- Providers construct module-local services/repositories and decorate them onto Elysia context.
- Put cross-module helpers under `src/libraries/`. Put stateful external integrations under `src/services/`.
- Keep route schemas beside their route handlers unless a schema is reused across modules.
- Return structured error objects like `{ message }` for non-2xx API responses.

## Frontend (`packages/frontend/`)

- `components/ui/` are **generated files** from `@shark` registry — do not edit manually.
- Prefer **server components**; only use `"use client"` when browser APIs or state are needed.
- Route entry files under `app/` should stay thin. Put business UI under `features/<feature>/components/`.
- Feature API calls, query keys, and mutations live under `features/<feature>/api.ts`, `query-keys.ts`, and `hooks/`.
- Pages using `nuqs` must split into server `page.tsx` + client `content.tsx` with `SectionBoundary` wrapping.
- Use Eden Treaty for typed API calls and TanStack Query for cache invalidation and automatic refresh.
- URL search params use **nuqs** (`useQueryState`/`useQueryStates`).

## Documentation

- Documentation must follow a reader path, not a stream of discovered facts.
- Each durable document must have one primary job. Split mixed topics into separate files and link between them.
- Use this order for durable docs: purpose, context, concepts, procedure, checklist.
- `README.md` is the public project entry point. `docs/README.md` is the documentation map.
- Architecture belongs in `docs/architecture.md`; backend module rules belong in `docs/backend-modules.md`; commands and validation belong in `docs/development.md`.
- When adding a new architectural boundary or workflow, update the documentation map first, then the focused document.

## Template Evolution

- A new capability should have an obvious home before implementation starts. If it does not, add a narrowly named module, service, library, or feature folder first.
- Prefer vertical slices for product behavior and horizontal services for infrastructure behavior.
- Keep examples production-shaped. Starter code should demonstrate the pattern future modules are expected to copy.
- Update this file when introducing a new architectural boundary, generated source, or cross-cutting convention.
