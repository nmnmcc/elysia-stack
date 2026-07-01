# elysia-stack

An opinionated full-stack TypeScript template built on Elysia, Bun, Next.js, Drizzle ORM, better-auth, Eden Treaty, and TanStack Query. It is shaped after `effect-stack`'s completeness, but uses Elysia-native API routing and Bun as the backend runtime.

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
│   │   │   └── services/
│   │   │       ├── auth/         # better-auth integration
│   │   │       ├── config/       # Typed runtime configuration
│   │   │       ├── database/     # Drizzle schema, migrations, and database factory
│   │   │       └── dependencies/ # Dependency container and Elysia injection plugin
│   │   ├── drizzle.config.ts
│   │   ├── Taskfile.yml
│   │   └── package.json
│   └── frontend/             # Next.js application
│       ├── src/
│       │   ├── app/          # Next.js App Router pages and layouts
│       │   ├── lib/          # Eden API client, auth helpers, utilities
│       │   └── components/   # Reusable UI components
│       ├── Taskfile.yml
│       ├── tsconfig.json
│       └── package.json
├── deploy/                   # Nomad Pack jobs for dev and production
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
```

Backend-specific commands:

```sh
task backend:database:generate # Generate Drizzle migrations
task backend:database:migrate  # Run Drizzle migrations
task backend:database:studio   # Open Drizzle Studio
task backend:auth:gen          # Regenerate better-auth schema
```

## Architecture

### Backend

The backend exports an Elysia app factory from `packages/backend/src/app.ts`. The exported `App` type is consumed by the frontend Eden Treaty client, giving route-level type safety without a code generation step.

Runtime services are assembled in `services/dependencies`. The dependency container builds `config`, `pool`, `database`, and `auth`, then injects them into Elysia through a plugin. Route handlers read dependencies from the Elysia context, and tests can pass overrides to `createApp({ database, auth, ... })` without touching process-wide state.

Routes define their request and response schemas with Elysia's `t` helper. OpenAPI documentation is generated by `@elysia/openapi` at `/api/docs`.

`better-auth` is mounted directly on the Elysia app, and authenticated todo mutations resolve the current session through `auth.api.getSession`. Drizzle owns the PostgreSQL schema and migration workflow.

### Frontend

The frontend uses Next.js App Router. API calls go through Eden Treaty in `src/lib/api-client.ts`, while TanStack Query provides cache state, loading/error states, and automatic refresh through query invalidation after todo mutations.

The starter UI includes sign in/sign up flows through better-auth and an authenticated todo list that exercises create, update, delete, and list endpoints.

## Deployment

### Local Development

Local development uses Nomad in `-dev` mode. The root `task dev` command starts the Nomad agent, creates the Docker network, runs stateful services, applies migrations, and starts the app processes on the host for fast reloads.

### Production

Production deployment templates live under `deploy/prod`. The setup builds separate backend, migration, and frontend images, then runs them through Nomad with configurable URLs, database credentials, S3-compatible object storage settings, resource limits, service checks, and rolling updates.

## License

[MIT](LICENSE)
