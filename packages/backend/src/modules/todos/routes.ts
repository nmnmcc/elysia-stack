import { Elysia, t } from "elysia";

import { getSession } from "../../libraries/auth/session";
import { errorModel } from "../../libraries/http/errors";
import { createDependenciesPlugin, type AppDependencies } from "../../services/dependencies";
import {
  createTodoBodyModel,
  listTodosQueryModel,
  todoIdParamsModel,
  todoModel,
  toTodoResponse,
  updateTodoBodyModel,
} from "./models";
import { createTodo, deleteTodo, findTodoById, listTodos, updateTodo } from "./repository";

const DEFAULT_PAGE_SIZE = 25;

export function createTodoRoutes(dependencies: AppDependencies) {
  return new Elysia({ name: "todos", prefix: "/api" })
    .use(createDependenciesPlugin(dependencies))
    .get(
      "/todos",
      async ({ database, query }) => {
        const rows = await listTodos(database, {
          limit: query.limit ?? DEFAULT_PAGE_SIZE,
          offset: query.offset ?? 0,
        });

        return rows.map(toTodoResponse);
      },
      {
        detail: { tags: ["Todos"] },
        query: listTodosQueryModel,
        response: {
          200: t.Array(todoModel),
        },
      },
    )
    .get(
      "/todos/:id",
      async ({ database, params, status }) => {
        const todo = await findTodoById(database, params.id);

        if (!todo) {
          return status(404, { message: "Todo not found" });
        }

        return toTodoResponse(todo);
      },
      {
        detail: { tags: ["Todos"] },
        params: todoIdParamsModel,
        response: {
          200: todoModel,
          404: errorModel,
        },
      },
    )
    .post(
      "/todos",
      async ({ auth, body, database, request, status }) => {
        const session = await getSession(auth, request);
        if (!session) {
          return status(401, { message: "Authentication required" });
        }

        const todo = await createTodo(database, {
          title: body.title,
          userId: session.user.id,
        });

        return toTodoResponse(todo);
      },
      {
        detail: { tags: ["Todos"] },
        body: createTodoBodyModel,
        response: {
          200: todoModel,
          401: errorModel,
        },
      },
    )
    .patch(
      "/todos/:id",
      async ({ auth, body, database, params, request, status }) => {
        const session = await getSession(auth, request);
        if (!session) {
          return status(401, { message: "Authentication required" });
        }

        const existingTodo = await findTodoById(database, params.id);

        if (!existingTodo) {
          return status(404, { message: "Todo not found" });
        }

        if (existingTodo.userId !== session.user.id) {
          return status(403, { message: "You cannot update this todo" });
        }

        const todo = await updateTodo(database, params.id, {
          title: body.title ?? undefined,
          isCompleted: body.isCompleted ?? undefined,
        });

        return toTodoResponse(todo);
      },
      {
        detail: { tags: ["Todos"] },
        params: todoIdParamsModel,
        body: updateTodoBodyModel,
        response: {
          200: todoModel,
          401: errorModel,
          403: errorModel,
          404: errorModel,
        },
      },
    )
    .delete(
      "/todos/:id",
      async ({ auth, database, params, request, status }) => {
        const session = await getSession(auth, request);
        if (!session) {
          return status(401, { message: "Authentication required" });
        }

        const existingTodo = await findTodoById(database, params.id);

        if (!existingTodo) {
          return status(404, { message: "Todo not found" });
        }

        if (existingTodo.userId !== session.user.id) {
          return status(403, { message: "You cannot delete this todo" });
        }

        await deleteTodo(database, params.id);
        return status(204, undefined);
      },
      {
        detail: { tags: ["Todos"] },
        params: todoIdParamsModel,
        response: {
          204: t.Void(),
          401: errorModel,
          403: errorModel,
          404: errorModel,
        },
      },
    );
}
