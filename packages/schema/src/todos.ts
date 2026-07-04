import { t, type Static } from "elysia";

export const Todo = t.Object({
  id: t.String({ format: "uuid" }),
  title: t.String(),
  isCompleted: t.Boolean(),
  userId: t.String({ format: "uuid" }),
  createdAt: t.String({ format: "date-time" }),
  updatedAt: t.String({ format: "date-time" }),
});

export const TodoList = t.Array(Todo);

export const QueryTodos = t.Object({
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100 })),
  offset: t.Optional(t.Numeric({ minimum: 0 })),
});

export const TodoIdParams = t.Object({
  id: t.String({ format: "uuid" }),
});

export const CreateTodoBody = t.Object({
  title: t.String({ minLength: 1, maxLength: 200 }),
});

export const UpdateTodoBody = t.Object({
  title: t.Optional(t.String({ minLength: 1, maxLength: 200 })),
  isCompleted: t.Optional(t.Boolean()),
});

export type Todo = Static<typeof Todo>;
export type TodoList = Static<typeof TodoList>;
export type QueryTodos = Static<typeof QueryTodos>;
export type TodoIdParams = Static<typeof TodoIdParams>;
export type CreateTodoBody = Static<typeof CreateTodoBody>;
export type UpdateTodoBody = Static<typeof UpdateTodoBody>;
