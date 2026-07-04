# Development Workflow

This document describes the day-to-day workflow for running, validating, and extending the template.

## Prerequisites

- Node.js 24
- Yarn 4
- Bun 1.3
- Docker
- devenv
- Nomad

`devenv shell` is the recommended way to get the expected local toolchain.

If `task` is not available in your shell, enter `devenv shell` first. The documented workflow assumes the devenv-provided toolchain so command behavior matches local development and CI expectations.

## Start The Stack

```sh
devenv shell
yarn install
task dev
```

`task dev` starts Nomad in dev mode, creates the Docker network, launches PostgreSQL and RustFS, runs migrations, and starts the backend and frontend with hot reload.

Useful local URLs:

- Frontend: <http://localhost:3000>
- Backend health: <http://localhost:30000/api/health>
- API docs: <http://localhost:30000/api/docs>

## Daily Commands

```sh
task dev:status          # Show service status
task dev:logs -- backend # Follow logs for one service
task dev:stop            # Stop services
task dev:reset           # Destroy local data and restart
task typecheck           # Type check all packages
task lint                # Lint all packages
task format              # Format files
task format:check        # Check formatting
task build               # Build backend and frontend
task validate            # Run format, type, lint, and build checks
```

## Database Workflow

```sh
task backend:database:generate # Generate Drizzle migrations
task backend:database:migrate  # Run Drizzle migrations
task backend:database:studio   # Open Drizzle Studio
task backend:auth:gen          # Regenerate better-auth schema
```

Add application tables under `packages/backend/src/services/database/schema/`. Export new schema files from `schema/index.ts`.

## Validation Before Commit

Run the full validation entry before publishing a shared change:

```sh
task validate
```

`task validate` runs the same checks in the project task system:

```sh
yarn prettier --check .
yarn tsc -b --noEmit
yarn workspace @elysia-stack/schema eslint src/
yarn workspace @elysia-stack/backend eslint src/
yarn workspace @elysia-stack/frontend eslint src/
yarn workspace @elysia-stack/backend rolldown -c
yarn workspace @elysia-stack/frontend next build
```

Use the individual commands when narrowing a failure, then return to `task validate` before publishing. Keeping the full check behind one task avoids hidden local shell snippets becoming the real release process.

For backend route changes, also run a smoke check:

```sh
PORT=30123 BETTER_AUTH_URL=http://localhost:30123 CORS_ORIGINS=http://localhost:3000 bun packages/backend/src/index.ts
curl -i http://127.0.0.1:30123/api/health
curl -s http://127.0.0.1:30123/api/docs/json
```

Remove generated build output such as `packages/backend/dist` and `packages/frontend/.next` before committing unless the file is intentionally tracked. Keep `devenv.lock` because it pins the development environment for reproducibility. TypeScript build info files are ignored caches and do not need manual cleanup.

## Adding A Feature

1. Read [Architecture](architecture.md) for package boundaries.
2. Add API/domain schemas under `packages/schema/src/` with PascalCase names shared by the schema value and inferred type. Use `Query` as the leading verb for query schemas.
3. Follow [Backend Module Standard](backend-modules.md) for backend code.
4. Follow [Frontend Feature Standard](frontend-features.md) for frontend code.
5. Keep route entry files under `packages/frontend/src/app/` thin.
6. Add or update database migrations when database schema changes.
7. Run the validation commands above.
