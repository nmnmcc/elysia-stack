import { t } from "elysia";

import type { todos } from "../../services/database/schema/todo";

export type TodoRecord = typeof todos.$inferSelect;

export interface ListTodosInput {
  readonly limit: number;
  readonly offset: number;
}

export interface CreateTodoInput {
  readonly title: string;
  readonly userId: string;
}

export interface UpdateTodoInput {
  readonly title?: string;
  readonly isCompleted?: boolean;
}

export const todoModel = t.Object({
  id: t.String({ format: "uuid" }),
  title: t.String(),
  isCompleted: t.Boolean(),
  userId: t.String({ format: "uuid" }),
  createdAt: t.String({ format: "date-time" }),
  updatedAt: t.String({ format: "date-time" }),
});

export const listTodosQueryModel = t.Object({
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100 })),
  offset: t.Optional(t.Numeric({ minimum: 0 })),
});

export const todoIdParamsModel = t.Object({
  id: t.String({ format: "uuid" }),
});

export const createTodoBodyModel = t.Object({
  title: t.String({ minLength: 1, maxLength: 200 }),
});

export const updateTodoBodyModel = t.Object({
  title: t.Optional(t.String({ minLength: 1, maxLength: 200 })),
  isCompleted: t.Optional(t.Boolean()),
});

export const toTodoResponse = (todo: TodoRecord) => ({
  ...todo,
  createdAt: todo.createdAt.toISOString(),
  updatedAt: todo.updatedAt.toISOString(),
});
