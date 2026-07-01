import { eq } from "drizzle-orm";

import type { Database } from "../../services/database";
import { todos } from "../../services/database/schema/todo";
import type { CreateTodoInput, ListTodosInput, UpdateTodoInput } from "./models";

export function listTodos(database: Database, input: ListTodosInput) {
  return database.query.todos.findMany({
    limit: input.limit,
    offset: input.offset,
    orderBy: (table, { desc }) => [desc(table.createdAt)],
  });
}

export function findTodoById(database: Database, id: string) {
  return database.query.todos.findFirst({
    where: (table, operators) => operators.eq(table.id, id),
  });
}

export async function createTodo(database: Database, input: CreateTodoInput) {
  const [todo] = await database
    .insert(todos)
    .values({
      title: input.title,
      userId: input.userId,
    })
    .returning();

  if (!todo) {
    throw new Error("Todo creation did not return a row");
  }

  return todo;
}

export async function updateTodo(database: Database, id: string, input: UpdateTodoInput) {
  const [todo] = await database.update(todos).set(input).where(eq(todos.id, id)).returning();

  if (!todo) {
    throw new Error("Todo update did not return a row");
  }

  return todo;
}

export function deleteTodo(database: Database, id: string) {
  return database.delete(todos).where(eq(todos.id, id));
}
