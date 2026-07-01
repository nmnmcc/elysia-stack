import type { TodoRecord, TodoResponse } from "./todos.types";

export function toTodoResponse(todo: TodoRecord): TodoResponse {
  return {
    id: todo.id,
    title: todo.title,
    isCompleted: todo.isCompleted,
    userId: todo.userId,
    createdAt: todo.createdAt.toISOString(),
    updatedAt: todo.updatedAt.toISOString(),
  };
}
