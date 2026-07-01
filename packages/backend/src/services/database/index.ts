import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import type { AppConfig } from "../config";
import * as relationDefinitions from "./relations";
import * as schema from "./schema/all";

export function createPool(config: AppConfig) {
  return new Pool({
    connectionString: config.database.url,
  });
}

export function createDatabase(pool: Pool) {
  return drizzle({
    client: pool,
    schema: {
      ...schema,
      ...relationDefinitions,
    },
  });
}

export type Database = ReturnType<typeof createDatabase>;
