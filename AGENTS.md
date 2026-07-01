# AGENTS.md

> This file contains project instructions for AI coding assistants. `CLAUDE.md` is a symlink to it.

## Code Style

- **No `as` type assertions** unless the type system genuinely cannot express the constraint.
- **Prefer Drizzle Queries API** (`db.query.*`) over query builder (`db.select().from()...`).
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
- Keep route schemas beside their route handlers unless a schema is reused across modules.
- Return structured error objects like `{ message }` for non-2xx API responses.

## Frontend (`packages/frontend/`)

- `components/ui/` are **generated files** from `@shark` registry — do not edit manually.
- Prefer **server components**; only use `"use client"` when browser APIs or state are needed.
- Pages using `nuqs` must split into server `page.tsx` + client `content.tsx` with `SectionBoundary` wrapping.
- Use Eden Treaty for typed API calls and TanStack Query for cache invalidation and automatic refresh.
- URL search params use **nuqs** (`useQueryState`/`useQueryStates`).
