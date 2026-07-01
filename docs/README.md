# Documentation

This documentation is organized as a reader path, not as a collection of notes. Start with the project overview, then move from system shape to implementation standards and daily workflow.

## Reading Path

1. [Project README](../README.md): what the template is, what it includes, and how to start it.
2. [Architecture](architecture.md): package boundaries, dependency direction, runtime flow, and extension path.
3. [Backend Module Standard](backend-modules.md): NestJS-inspired backend module rules.
4. [Frontend Feature Standard](frontend-features.md): Next.js feature, API, hook, query, and route rules.
5. [Development Workflow](development.md): commands, validation, database workflow, and release checks.

## Documentation Rules

Every durable document should follow this order:

1. Purpose: what question the document answers.
2. Context: where the topic fits in the system.
3. Concepts: the mental model and boundaries.
4. Procedure: how to do the work.
5. Checklist: how to review the work.

Keep one document focused on one job. If a section starts explaining a different job, move that section to a better home and link to it.

## Ownership

- `README.md` is the public entry point.
- `docs/README.md` is the documentation map.
- `docs/architecture.md` owns system structure.
- `docs/backend-modules.md` owns backend module conventions.
- `docs/frontend-features.md` owns frontend feature conventions.
- `docs/development.md` owns daily commands and validation workflow.
