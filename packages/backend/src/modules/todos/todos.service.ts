import type { TodosRepository } from "./todos.repository";
import type {
  CreateTodoInput,
  DeleteTodoForUserInput,
  ListTodosInput,
  TodoDeleteResult,
  TodoMutationResult,
  UpdateTodoForUserInput,
} from "./todos.types";

export class TodosService {
  constructor(private readonly todosRepository: TodosRepository) {}

  list(input: ListTodosInput) {
    return this.todosRepository.list(input);
  }

  findById(id: string) {
    return this.todosRepository.findById(id);
  }

  create(input: CreateTodoInput) {
    return this.todosRepository.create(input);
  }

  async updateForUser(input: UpdateTodoForUserInput): Promise<TodoMutationResult> {
    const existingTodo = await this.todosRepository.findById(input.id);

    if (!existingTodo) {
      return { state: "not-found" };
    }

    if (existingTodo.userId !== input.userId) {
      return { state: "forbidden" };
    }

    const todo = await this.todosRepository.update(input.id, {
      title: input.title ?? undefined,
      isCompleted: input.isCompleted ?? undefined,
    });

    return { state: "success", todo };
  }

  async deleteForUser(input: DeleteTodoForUserInput): Promise<TodoDeleteResult> {
    const existingTodo = await this.todosRepository.findById(input.id);

    if (!existingTodo) {
      return { state: "not-found" };
    }

    if (existingTodo.userId !== input.userId) {
      return { state: "forbidden" };
    }

    await this.todosRepository.delete(input.id);

    return { state: "success" };
  }
}
