import type { todos } from "../../services/database/schema/todo";

export type TodoRecord = typeof todos.$inferSelect;

export interface TodoResponse {
  readonly id: string;
  readonly title: string;
  readonly isCompleted: boolean;
  readonly userId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

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

export interface UpdateTodoForUserInput extends UpdateTodoInput {
  readonly id: string;
  readonly userId: string;
}

export interface DeleteTodoForUserInput {
  readonly id: string;
  readonly userId: string;
}

export type TodoMutationResult =
  | {
      readonly state: "success";
      readonly todo: TodoRecord;
    }
  | {
      readonly state: "not-found";
    }
  | {
      readonly state: "forbidden";
    };

export type TodoDeleteResult =
  | {
      readonly state: "success";
    }
  | {
      readonly state: "not-found";
    }
  | {
      readonly state: "forbidden";
    };
