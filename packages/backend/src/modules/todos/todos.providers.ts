import { Elysia } from "elysia";

import type { AppDependencies } from "../../services/dependencies";
import { TodosRepository } from "./todos.repository";
import { TodosService } from "./todos.service";

export function createTodosProviders(dependencies: AppDependencies) {
  const todosRepository = new TodosRepository(dependencies.database);
  const todosService = new TodosService(todosRepository);

  return new Elysia({ name: "todos.providers" }).decorate("todosService", todosService);
}
