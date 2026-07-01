import type { App } from "@elysia-stack/backend/api";
import { treaty } from "@elysia/eden";

import config from "../../config";

const getBaseUrl = () => {
  if (config.backend.url) return config.backend.url.toString();
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:3000";
};

export const api = treaty<App>(getBaseUrl(), {
  fetch: {
    credentials: "include",
  },
});
