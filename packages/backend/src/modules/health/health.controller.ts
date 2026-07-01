import { Elysia, t } from "elysia";

export function createHealthController() {
  return new Elysia({ name: "health.controller" }).get("/api/health", ({ status }) => status(204, undefined), {
    detail: { tags: ["Health"] },
    response: {
      204: t.Void(),
    },
  });
}
