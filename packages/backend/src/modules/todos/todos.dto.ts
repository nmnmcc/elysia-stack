import { t } from "elysia";

export const todoResponseDto = t.Object({
  id: t.String({ format: "uuid" }),
  title: t.String(),
  isCompleted: t.Boolean(),
  userId: t.String({ format: "uuid" }),
  createdAt: t.String({ format: "date-time" }),
  updatedAt: t.String({ format: "date-time" }),
});

export const listTodosQueryDto = t.Object({
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100 })),
  offset: t.Optional(t.Numeric({ minimum: 0 })),
});

export const todoIdParamsDto = t.Object({
  id: t.String({ format: "uuid" }),
});

export const createTodoBodyDto = t.Object({
  title: t.String({ minLength: 1, maxLength: 200 }),
});

export const updateTodoBodyDto = t.Object({
  title: t.Optional(t.String({ minLength: 1, maxLength: 200 })),
  isCompleted: t.Optional(t.Boolean()),
});
