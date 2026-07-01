import { Elysia, t } from "elysia";

import { requireSession } from "../../libraries/auth/guards";
import { errorModel } from "../../libraries/http/errors";
import { createDependenciesPlugin, type AppDependencies } from "../../services/dependencies";
import { createTodoBodyDto, listTodosQueryDto, todoIdParamsDto, todoResponseDto, updateTodoBodyDto } from "./todos.dto";
import { toTodoResponse } from "./todos.mapper";
import { createTodosProviders } from "./todos.providers";

const DEFAULT_PAGE_SIZE = 25;

export function createTodosController(dependencies: AppDependencies) {
  return new Elysia({ name: "todos.controller", prefix: "/api" })
    .use(createDependenciesPlugin(dependencies))
    .use(createTodosProviders(dependencies))
    .get(
      "/todos",
      async ({ query, todosService }) => {
        const todos = await todosService.list({
          limit: query.limit ?? DEFAULT_PAGE_SIZE,
          offset: query.offset ?? 0,
        });

        return todos.map(toTodoResponse);
      },
      {
        detail: { tags: ["Todos"] },
        query: listTodosQueryDto,
        response: {
          200: t.Array(todoResponseDto),
        },
      },
    )
    .get(
      "/todos/:id",
      async ({ params, status, todosService }) => {
        const todo = await todosService.findById(params.id);

        if (!todo) {
          return status(404, { message: "Todo not found" });
        }

        return toTodoResponse(todo);
      },
      {
        detail: { tags: ["Todos"] },
        params: todoIdParamsDto,
        response: {
          200: todoResponseDto,
          404: errorModel,
        },
      },
    )
    .post(
      "/todos",
      async ({ auth, body, request, status, todosService }) => {
        const sessionResult = await requireSession(auth, request);
        if (!sessionResult.isAuthenticated) {
          return status(401, { message: "Authentication required" });
        }

        const todo = await todosService.create({
          title: body.title,
          userId: sessionResult.session.user.id,
        });

        return toTodoResponse(todo);
      },
      {
        detail: { tags: ["Todos"] },
        body: createTodoBodyDto,
        response: {
          200: todoResponseDto,
          401: errorModel,
        },
      },
    )
    .patch(
      "/todos/:id",
      async ({ auth, body, params, request, status, todosService }) => {
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

        return toTodoResponse(result.todo);
      },
      {
        detail: { tags: ["Todos"] },
        params: todoIdParamsDto,
        body: updateTodoBodyDto,
        response: {
          200: todoResponseDto,
          401: errorModel,
          403: errorModel,
          404: errorModel,
        },
      },
    )
    .delete(
      "/todos/:id",
      async ({ auth, params, request, status, todosService }) => {
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
        params: todoIdParamsDto,
        response: {
          204: t.Void(),
          401: errorModel,
          403: errorModel,
          404: errorModel,
        },
      },
    );
}
