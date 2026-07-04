import { eq } from "drizzle-orm";

import type { Database } from "../../services/database";
import { todos } from "../../services/database/schema/todo";

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

export class TodosData {
  constructor(private readonly database: Database) {}

  list(input: ListTodosInput) {
    return this.database.query.todos.findMany({
      limit: input.limit,
      offset: input.offset,
      orderBy: (table, { desc }) => [desc(table.createdAt)],
    });
  }

  findById(id: string) {
    return this.database.query.todos.findFirst({
      where: (table, operators) => operators.eq(table.id, id),
    });
  }

  async create(input: CreateTodoInput) {
    const [todo] = await this.database
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

  async update(id: string, input: UpdateTodoInput) {
    const [todo] = await this.database.update(todos).set(input).where(eq(todos.id, id)).returning();

    if (!todo) {
      throw new Error("Todo update did not return a row");
    }

    return todo;
  }

  delete(id: string) {
    return this.database.delete(todos).where(eq(todos.id, id));
  }
}
