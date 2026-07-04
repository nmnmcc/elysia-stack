import { Elysia, t } from "elysia";

export function createHealthModule() {
  return new Elysia({ name: "health.module" }).get("/api/health", ({ status }) => status(204, undefined), {
    detail: { tags: ["Health"] },
    response: {
      204: t.Void(),
    },
  });
}
