import type { Pool } from "pg";

import { make } from "./make";

export const createAuth = (pool: Pool, baseURL: string) => make(pool, baseURL);

export type Auth = ReturnType<typeof createAuth>;
