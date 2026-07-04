import {
  CreateTodoBody,
  ErrorResponse,
  QueryTodos,
  Todo,
  TodoIdParams,
  TodoList,
  UpdateTodoBody,
  type Todo as TodoContract,
} from "@elysia-stack/schema";
import { Elysia, t } from "elysia";

import { requireSession } from "../../libraries/auth/guards";
import { createDependenciesPlugin, type AppDependencies } from "../../services/dependencies";
import { TodosData, type TodoRecord } from "./data";
import { TodosService } from "./service";

const DEFAULT_PAGE_SIZE = 25;

function toTodo(todo: TodoRecord): TodoContract {
  return {
    id: todo.id,
    title: todo.title,
    isCompleted: todo.isCompleted,
    userId: todo.userId,
    createdAt: todo.createdAt.toISOString(),
    updatedAt: todo.updatedAt.toISOString(),
  };
}

export function createTodosModule(dependencies: AppDependencies) {
  const todosData = new TodosData(dependencies.database);
  const todosService = new TodosService(todosData);

  return new Elysia({ name: "todos.module", prefix: "/api" })
    .use(createDependenciesPlugin(dependencies))
    .get(
      "/todos",
      async ({ query }) => {
        const todos = await todosService.list({
          limit: query.limit ?? DEFAULT_PAGE_SIZE,
          offset: query.offset ?? 0,
        });

        return todos.map(toTodo);
      },
      {
        detail: { tags: ["Todos"] },
        query: QueryTodos,
        response: {
          200: TodoList,
        },
      },
    )
    .get(
      "/todos/:id",
      async ({ params, status }) => {
        const todo = await todosService.findById(params.id);

        if (!todo) {
          return status(404, { message: "Todo not found" });
        }

        return toTodo(todo);
      },
      {
        detail: { tags: ["Todos"] },
        params: TodoIdParams,
        response: {
          200: Todo,
          404: ErrorResponse,
        },
      },
    )
    .post(
      "/todos",
      async ({ auth, body, request, status }) => {
        const sessionResult = await requireSession(auth, request);
        if (!sessionResult.isAuthenticated) {
          return status(401, { message: "Authentication required" });
        }

        const todo = await todosService.create({
          title: body.title,
          userId: sessionResult.session.user.id,
        });

        return toTodo(todo);
      },
      {
        detail: { tags: ["Todos"] },
        body: CreateTodoBody,
        response: {
          200: Todo,
          401: ErrorResponse,
        },
      },
    )
    .patch(
      "/todos/:id",
      async ({ auth, body, params, request, status }) => {
        const sessionResult = await requireSession(auth, request);
        if (!sessionResult.isAuthenticated) {
          return status(401, { message: "Authentication required" });
        }

        const result = await todosService.updateForUser({
          id: params.id,
          userId: sessionResult.session.user.id,
          title: body.title ?? undefined,
          isCompleted: body.isCompleted ?? undefined,
        });

        if (result.state === "not-found") {
          return status(404, { message: "Todo not found" });
        }

        if (result.state === "forbidden") {
          return status(403, { message: "You cannot update this todo" });
        }

        return toTodo(result.todo);
      },
      {
        detail: { tags: ["Todos"] },
        params: TodoIdParams,
        body: UpdateTodoBody,
        response: {
          200: Todo,
          401: ErrorResponse,
          403: ErrorResponse,
          404: ErrorResponse,
        },
      },
    )
    .delete(
      "/todos/:id",
      async ({ auth, params, request, status }) => {
        const sessionResult = await requireSession(auth, request);
        if (!sessionResult.isAuthenticated) {
          return status(401, { message: "Authentication required" });
        }

        const result = await todosService.deleteForUser({
          id: params.id,
          userId: sessionResult.session.user.id,
        });

        if (result.state === "not-found") {
          return status(404, { message: "Todo not found" });
        }

        if (result.state === "forbidden") {
          return status(403, { message: "You cannot delete this todo" });
        }

        return status(204, undefined);
      },
      {
        detail: { tags: ["Todos"] },
        params: TodoIdParams,
        response: {
          204: t.Void(),
          401: ErrorResponse,
          403: ErrorResponse,
          404: ErrorResponse,
        },
      },
    );
}
