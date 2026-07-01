import type { AppDependencies } from "../../services/dependencies";
import { createTodosController } from "./todos.controller";

export function createTodosModule(dependencies: AppDependencies) {
  return createTodosController(dependencies);
}
