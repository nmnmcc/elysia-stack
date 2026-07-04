# AGENTS.md

> This file contains project instructions for AI coding assistants. `CLAUDE.md` is a symlink to it.

## Code Style

- **No `as` type assertions** unless the type system genuinely cannot express the constraint. Prefer typed variables, `satisfies`, narrowing, or helper functions so unsafe escapes stay visible.
- **Prefer Drizzle Queries API** (`database.query.*`) over query builder (`database.select().from()...`) for reads. This keeps relation-aware reads consistent and easier to copy across repositories.
- **No conditional spread for optional properties**. Use `key: x ?? undefined` instead of `...(x ? { key: x } : {})` so object shapes remain obvious to TypeScript and reviewers.
- **`database` is always spelled out**, never abbreviated to `db`. The full name makes injected persistence dependencies easy to scan and avoids local aliases drifting across modules.
- **`index.ts` may contain implementation code**, not just re-exports. Files within the same directory must not import from the directory's own `index.ts`, because that creates avoidable circular-import risk.
- **Boolean variables** must use `is`/`has`/`should`/`can` prefixes or adjective/past-participle forms. This keeps conditions readable without requiring readers to inspect the assigned expression.
- **Prefer `export * from "..."`** in barrel files over listing individual exports. This keeps barrels mechanical and reduces churn when symbols are added.

## Standard Workflow

1. Read this file, then the nearest focused document before changing code.
2. Identify the owning layer: contract, runtime code, persistence, presentation, configuration, tests, or documentation.
3. Copy the closest existing pattern before adding a new abstraction.
4. Make the smallest complete change, including code, docs, and validation when relevant.
5. Run the narrowest useful check first, then `task validate` before publishing shared changes.
6. If a durable rule changes, update the nearest documentation with the reason for the rule.

## Backend (`packages/backend/`)

- Run the Elysia server with Bun in development and production.
- Keep runtime configuration in `services/config/index.ts`.
- Wire application-wide backend services through `services/dependencies/index.ts`; module-local services should be constructed in the module entry from those dependencies. This keeps injection explicit without adding provider boilerplate.
- Export the Elysia `App` type from `src/app.ts` so Eden Treaty clients stay type-safe.
- Keep `src/app.ts` as application composition only. Put domain code under `src/modules/<module>/`.
- Backend modules default to a three-file feature slice: `index.ts`, `service.ts`, and `data.ts`. This keeps placement predictable without forcing empty NestJS-style files into small modules.
- `index.ts` owns the Elysia plugin, routes, imported schema binding, OpenAPI metadata, guard calls, module-local service construction, and HTTP status mapping. It must not query the database directly.
- `service.ts` owns business rules and authorization decisions. It must not return Elysia `status(...)` responses.
- `data.ts` owns persistence and persistence mapping. It must not access request, auth, cookie, or HTTP status APIs.
- Split extra files only when one of the three files becomes hard to scan or a schema/type is reused across modules. This keeps the default simple while leaving an escape hatch for real complexity.
- Put cross-module helpers under `src/libraries/`. Put stateful external integrations under `src/services/`.
- Keep API and domain schemas in `packages/schema`. Schema values use PascalCase and share the same exported name as their TypeScript type, with no `Schema` or `Dto` suffix; query schemas use `Query` as a leading verb, such as `QueryTodos`. This keeps runtime contracts and inferred types paired without backend-specific naming leaking across packages.
- Keep Drizzle table schemas in `packages/backend/src/services/database/schema/`. Database schemas describe persistence shape, not API/domain contracts.
- Return structured error objects like `{ message }` for non-2xx API responses.

## Frontend (`packages/frontend/`)

- `components/ui/` are **generated files** from `@shark` registry — do not edit manually.
- Prefer **server components**; only use `"use client"` when browser APIs or state are needed.
- Route entry files under `app/` should stay thin. Put business UI under `features/<feature>/components/`.
- Feature API calls must live in `features/<feature>/api.ts` and use Eden Treaty for internal backend routes.
- Query keys must live in `features/<feature>/query-keys.ts`; mutations should invalidate centralized keys rather than ad hoc arrays.
- Feature queries, mutations, invalidation, optimistic updates, and URL-state hooks live under `features/<feature>/hooks/`.
- Feature-specific UI lives under `features/<feature>/components/`; shared UI lives under `components/`.
- Pages using `nuqs` must split into server `page.tsx` + client `content.tsx` with `SectionBoundary` wrapping.
- Use Eden Treaty for typed API calls and TanStack Query for cache invalidation and automatic refresh.
- URL search params use **nuqs** (`useQueryState`/`useQueryStates`).

## Documentation

- Documentation must follow a reader path, not a stream of discovered facts.
- Each durable document must have one primary job. Split mixed topics into separate files and link between them.
- Use this order for durable docs: purpose, context, concepts, procedure, checklist.
- `README.md` is the public project entry point. `docs/README.md` is the documentation map.
- Architecture belongs in `docs/architecture.md`; backend module rules belong in `docs/backend-modules.md`; frontend feature rules belong in `docs/frontend-features.md`; commands and validation belong in `docs/development.md`.
- When adding a new architectural boundary or workflow, update the documentation map first, then the focused document.
- Every persistent rule must include its reason. Rules without reasons become cargo cult and are harder to revise safely.

## Template Evolution

- A new capability should have an obvious home before implementation starts. If it does not, add a narrowly named module, service, library, or feature folder first.
- Prefer vertical slices for product behavior and horizontal services for infrastructure behavior.
- Keep examples production-shaped. Starter code should demonstrate the pattern future modules are expected to copy.
- Update this file when introducing a new architectural boundary, generated source, or cross-cutting convention.
