# elysia-stack

An opinionated full-stack TypeScript template built on Elysia, Bun, Next.js, Drizzle ORM, better-auth, Eden Treaty, and TanStack Query. It is shaped after `effect-stack`'s completeness, but uses Elysia-native API routing and Bun as the backend runtime.

## Documentation

Read the documentation in this order:

1. [Agent and Maintainer Guide](AGENTS.md): repository rules, reasons, and change workflow.
2. [Architecture](docs/architecture.md): system boundaries, dependency direction, runtime flow, and extension path.
3. [Backend Module Standard](docs/backend-modules.md): three-file backend module contract.
4. [Frontend Feature Standard](docs/frontend-features.md): Next.js feature, API, hook, query, and route contract.
5. [Development Workflow](docs/development.md): local commands, database workflow, validation, and smoke checks.
6. [Documentation Map](docs/README.md): documentation ownership and writing rules.

## Tech Stack

- **Elysia 1.4** -- Ergonomic, type-safe HTTP server with route schemas and OpenAPI support
- **Bun 1.3** -- Backend runtime and development server
- **Eden Treaty** -- End-to-end typed frontend client generated from the Elysia app type
- **TanStack Query** -- Frontend caching, mutations, and automatic query invalidation
- **Next.js 16** -- React framework with App Router and standalone production output
- **React 19** -- UI library with concurrent features and server component support
- **Drizzle ORM** -- Type-safe SQL query builder and schema management
- **PostgreSQL** -- Primary database
- **better-auth** -- Authentication library with session management
- **Ark UI + shadcn** -- Accessible component primitives with shadcn styling
- **Tailwind CSS 4** -- Utility-first CSS framework
- **Nomad** -- Orchestration for local development and production deployment
- **Docker** -- Container runtime for services and production images

## Project Structure

```text
elysia-stack/
├── packages/
│   ├── backend/              # Elysia API server
│   │   ├── src/
│   │   │   ├── app.ts        # Elysia app factory and exported App type
│   │   │   ├── index.ts      # Bun server entry point
│   │   │   ├── libraries/    # Stateless cross-module helpers
│   │   │   ├── modules/      # Product modules organized by capability
│   │   │   └── services/
│   │   │       ├── auth/         # better-auth integration
│   │   │       ├── config/       # Typed runtime configuration
│   │   │       ├── database/     # Drizzle schema, migrations, and database factory
│   │   │       └── dependencies/ # Dependency container and Elysia injection plugin
│   │   ├── drizzle.config.ts
│   │   ├── Taskfile.yml
│   │   └── package.json
│   ├── frontend/             # Next.js application
│       ├── src/
│       │   ├── app/          # Next.js App Router pages and layouts
│       │   ├── features/     # Product features with API calls, hooks, query keys, and UI
│       │   ├── lib/          # Eden API client, auth helpers, utilities
│       │   └── components/   # Reusable UI components
│   │   ├── Taskfile.yml
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── schema/               # Shared API and domain schemas
│       ├── src/
│       ├── Taskfile.yml
│       ├── tsconfig.json
│       └── package.json
├── deploy/                   # Nomad Pack jobs for dev and production
├── docs/                     # Architecture and extension guidelines
├── Dockerfile.backend
├── Dockerfile.frontend
├── Taskfile.yml              # Root task runner
├── devenv.nix                # Nix development environment
├── package.json              # Yarn workspaces root
└── tsconfig.base.json        # Shared TypeScript configuration
```

## Getting Started

### Prerequisites

- **Node.js 24** -- JavaScript toolchain for the workspace and Next.js
- **Yarn 4** -- Package manager, configured through Corepack or devenv
- **Bun 1.3** -- Backend runtime for Elysia
- **Docker** -- Required for PostgreSQL and object storage services
- **devenv** -- Nix-based development environment, recommended
- **Nomad** -- Service orchestrator for local development, provided by devenv

### Quick Start

1. Clone the repository:

   ```sh
   git clone <repo-url> elysia-stack
   cd elysia-stack
   ```

2. Enter the development environment:

   ```sh
   devenv shell
   ```

3. Install dependencies:

   ```sh
   yarn install
   ```

4. Start the development environment:

   ```sh
   task dev
   ```

   This starts Nomad in dev mode, creates the Docker network, launches PostgreSQL and RustFS, runs database migrations, and starts both the Elysia backend and Next.js frontend with hot reload.

5. Open the app:

   - Frontend: <http://localhost:3000>
   - Backend health: <http://localhost:30000/api/health>
   - API docs: <http://localhost:30000/api/docs>

## Common Commands

```sh
task dev:status          # Show status of all services
task dev:logs -- backend # Follow logs for a specific service
task dev:stop            # Stop all services
task dev:reset           # Destroy data and restart fresh
task typecheck           # Type check all packages
task lint                # Lint all packages
task format              # Format code with Prettier
task build               # Build backend and frontend
task validate            # Run format, type, lint, and build checks
```

Backend-specific commands:

```sh
task backend:database:generate # Generate Drizzle migrations
task backend:database:migrate  # Run Drizzle migrations
task backend:database:studio   # Open Drizzle Studio
task backend:auth:gen          # Regenerate better-auth schema
```

## Architecture

The system is organized around typed vertical slices:

### Backend

- `packages/backend/src/app.ts` composes application plugins and modules.
- `packages/schema` owns reusable API and domain schemas with PascalCase names shared by schema values and inferred types; query schemas use `Query` as the leading verb.
- `services/dependencies` creates `config`, `pool`, `database`, and `auth`.
- `modules/<module>` uses a three-file feature slice: `index.ts` for routes and module composition, `service.ts` for business rules, and `data.ts` for persistence.
- Elysia route schemas generate OpenAPI docs and preserve Eden Treaty type safety.

### Frontend

- `packages/frontend/src/app` contains Next.js route shells.
- `features/<feature>` contains product UI, Eden API calls, query keys, and TanStack Query hooks.
- Eden Treaty consumes the backend `App` type without a code generation step.
- TanStack Query handles cache state and invalidation after mutations.
- Frontend feature conventions are documented in [Frontend Feature Standard](docs/frontend-features.md).

See [Architecture](docs/architecture.md) for the full system model.

## Deployment

### Local Development

Local development uses Nomad in `-dev` mode. The root `task dev` command starts the Nomad agent, creates the Docker network, runs stateful services, applies migrations, and starts the app processes on the host for fast reloads.

### Production

Production deployment templates live under `deploy/prod`. The setup builds separate backend, migration, and frontend images, then runs them through Nomad with configurable URLs, database credentials, S3-compatible object storage settings, resource limits, service checks, and rolling updates.

## License

[MIT](LICENSE)
