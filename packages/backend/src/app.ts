import { openapi } from "@elysia/openapi";
import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";

import { createHealthModule } from "./modules/health/health.module";
import { createTodosModule } from "./modules/todos/todos.module";
import { createDependencies, createDependenciesPlugin, type AppDependencyOverrides } from "./services/dependencies";

export function createApp(overrides: AppDependencyOverrides = {}) {
  const dependencies = createDependencies(overrides);

  const app = new Elysia()
    .use(createDependenciesPlugin(dependencies))
    .use(
      cors({
        origin: dependencies.config.server.corsOrigins,
        credentials: true,
        methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
      }),
    )
    .use(
      openapi({
        path: "/api/docs",
        documentation: {
          info: {
            title: "elysia-stack API",
            version: "0.1.0",
          },
          tags: [
            { name: "Health", description: "Service health endpoints" },
            { name: "Todos", description: "Authenticated todo management" },
          ],
        },
      }),
    )
    .mount(dependencies.auth.handler)
    .use(createHealthModule())
    .use(createTodosModule(dependencies));

  return { app, dependencies };
}

export type App = ReturnType<typeof createApp>["app"];
