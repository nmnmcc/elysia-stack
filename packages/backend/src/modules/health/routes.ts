import { Elysia, t } from "elysia";

export function createHealthRoutes() {
  return new Elysia({ name: "health" }).get("/api/health", ({ status }) => status(204, undefined), {
    detail: { tags: ["Health"] },
    response: {
      204: t.Void(),
    },
  });
}
