import { openapi } from "@elysia/openapi";
import { cors } from "@elysiajs/cors";
import { eq } from "drizzle-orm";
import { Elysia, t } from "elysia";

import { createAuth } from "./services/auth";
import { loadConfig, type AppConfig } from "./services/config";
import { createDatabase, createPool, type Database } from "./services/database";
import { todos } from "./services/database/schema/todo";

export interface AppServices {
  readonly config?: AppConfig;
  readonly database?: Database;
  readonly pool?: ReturnType<typeof createPool>;
}

const todoModel = t.Object({
  id: t.String({ format: "uuid" }),
  title: t.String(),
  isCompleted: t.Boolean(),
  userId: t.String({ format: "uuid" }),
  createdAt: t.String({ format: "date-time" }),
  updatedAt: t.String({ format: "date-time" }),
});

const errorModel = t.Object({
  message: t.String(),
});

type TodoRow = typeof todos.$inferSelect;

const toTodo = (todo: TodoRow) => ({
  ...todo,
  createdAt: todo.createdAt.toISOString(),
  updatedAt: todo.updatedAt.toISOString(),
});

export function createApp(services: AppServices = {}) {
  const config = services.config ?? loadConfig();
  const pool = services.pool ?? createPool(config);
  const database = services.database ?? createDatabase(pool);
  const auth = createAuth(pool, config.auth.baseURL);

  const app = new Elysia()
    .use(
      cors({
        origin: config.server.corsOrigins,
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
    .mount(auth.handler)
    .get("/api/health", ({ status }) => status(204, undefined), {
      detail: { tags: ["Health"] },
      response: {
        204: t.Void(),
      },
    })
    .get(
      "/api/todos",
      async ({ query }) => {
        const rows = await database.query.todos.findMany({
          limit: query.limit ?? 25,
          offset: query.offset ?? 0,
          orderBy: (table, { desc }) => [desc(table.createdAt)],
        });

        return rows.map(toTodo);
      },
      {
        detail: { tags: ["Todos"] },
        query: t.Object({
          limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100 })),
          offset: t.Optional(t.Numeric({ minimum: 0 })),
        }),
        response: {
          200: t.Array(todoModel),
        },
      },
    )
    .get(
      "/api/todos/:id",
      async ({ params, status }) => {
        const row = await database.query.todos.findFirst({
          where: (table, operators) => operators.eq(table.id, params.id),
        });

        if (!row) {
          return status(404, { message: "Todo not found" });
        }

        return toTodo(row);
      },
      {
        detail: { tags: ["Todos"] },
        params: t.Object({
          id: t.String({ format: "uuid" }),
        }),
        response: {
          200: todoModel,
          404: errorModel,
        },
      },
    )
    .post(
      "/api/todos",
      async ({ body, request, status }) => {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
          return status(401, { message: "Authentication required" });
        }

        const [row] = await database
          .insert(todos)
          .values({
            title: body.title,
            userId: session.user.id,
          })
          .returning();

        return toTodo(row!);
      },
      {
        detail: { tags: ["Todos"] },
        body: t.Object({
          title: t.String({ minLength: 1, maxLength: 200 }),
        }),
        response: {
          200: todoModel,
          401: errorModel,
        },
      },
    )
    .patch(
      "/api/todos/:id",
      async ({ body, params, request, status }) => {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
          return status(401, { message: "Authentication required" });
        }

        const existing = await database.query.todos.findFirst({
          where: (table, operators) => operators.eq(table.id, params.id),
        });

        if (!existing) {
          return status(404, { message: "Todo not found" });
        }

        if (existing.userId !== session.user.id) {
          return status(403, { message: "You cannot update this todo" });
        }

        const updates: Partial<typeof todos.$inferInsert> = {};
        if (body.title !== undefined) updates.title = body.title;
        if (body.isCompleted !== undefined) updates.isCompleted = body.isCompleted;

        const [row] = await database.update(todos).set(updates).where(eq(todos.id, params.id)).returning();

        return toTodo(row!);
      },
      {
        detail: { tags: ["Todos"] },
        params: t.Object({
          id: t.String({ format: "uuid" }),
        }),
        body: t.Object({
          title: t.Optional(t.String({ minLength: 1, maxLength: 200 })),
          isCompleted: t.Optional(t.Boolean()),
        }),
        response: {
          200: todoModel,
          401: errorModel,
          403: errorModel,
          404: errorModel,
        },
      },
    )
    .delete(
      "/api/todos/:id",
      async ({ params, request, status }) => {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
          return status(401, { message: "Authentication required" });
        }

        const existing = await database.query.todos.findFirst({
          where: (table, operators) => operators.eq(table.id, params.id),
        });

        if (!existing) {
          return status(404, { message: "Todo not found" });
        }

        if (existing.userId !== session.user.id) {
          return status(403, { message: "You cannot delete this todo" });
        }

        await database.delete(todos).where(eq(todos.id, params.id));
        return status(204, undefined);
      },
      {
        detail: { tags: ["Todos"] },
        params: t.Object({
          id: t.String({ format: "uuid" }),
        }),
        response: {
          204: t.Void(),
          401: errorModel,
          403: errorModel,
          404: errorModel,
        },
      },
    );

  return { app, auth, config, database, pool } as const;
}

export type App = ReturnType<typeof createApp>["app"];
