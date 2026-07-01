import { createHealthController } from "./health.controller";

export function createHealthModule() {
  return createHealthController();
}
