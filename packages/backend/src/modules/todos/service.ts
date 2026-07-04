import type { CreateTodoInput, ListTodosInput, TodoRecord, TodosData, UpdateTodoInput } from "./data";

export class TodosService {
  constructor(private readonly todosData: TodosData) {}

  list(input: ListTodosInput) {
    return this.todosData.list(input);
  }

  findById(id: string) {
    return this.todosData.findById(id);
  }

  create(input: CreateTodoInput) {
    return this.todosData.create(input);
  }

  async updateForUser(input: UpdateTodoForUserInput): Promise<TodoMutationResult> {
    const existingTodo = await this.todosData.findById(input.id);

    if (!existingTodo) {
      return { state: "not-found" };
    }

    if (existingTodo.userId !== input.userId) {
      return { state: "forbidden" };
    }

    const todo = await this.todosData.update(input.id, {
      title: input.title ?? undefined,
      isCompleted: input.isCompleted ?? undefined,
    });

    return { state: "success", todo };
  }

  async deleteForUser(input: DeleteTodoForUserInput): Promise<TodoDeleteResult> {
    const existingTodo = await this.todosData.findById(input.id);

    if (!existingTodo) {
      return { state: "not-found" };
    }

    if (existingTodo.userId !== input.userId) {
      return { state: "forbidden" };
    }

    await this.todosData.delete(input.id);

    return { state: "success" };
  }
}

interface UpdateTodoForUserInput extends UpdateTodoInput {
  readonly id: string;
  readonly userId: string;
}

interface DeleteTodoForUserInput {
  readonly id: string;
  readonly userId: string;
}

type TodoMutationResult =
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

type TodoDeleteResult =
  | {
      readonly state: "success";
    }
  | {
      readonly state: "not-found";
    }
  | {
      readonly state: "forbidden";
    };
