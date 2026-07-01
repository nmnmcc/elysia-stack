import { Elysia } from "elysia";
import type { Pool } from "pg";

import { createAuth, type Auth } from "../auth";
import { loadConfig, type AppConfig } from "../config";
import { createDatabase, createPool, type Database } from "../database";

export interface AppDependencyOverrides {
  readonly auth?: Auth;
  readonly config?: AppConfig;
  readonly database?: Database;
  readonly pool?: Pool;
}

export interface AppDependencies {
  readonly auth: Auth;
  readonly config: AppConfig;
  readonly database: Database;
  readonly pool: Pool;
}

export function createDependencies(overrides: AppDependencyOverrides = {}): AppDependencies {
  const config = overrides.config ?? loadConfig();
  const pool = overrides.pool ?? createPool(config);
  const database = overrides.database ?? createDatabase(pool);
  const auth = overrides.auth ?? createAuth(pool, config.auth.baseURL);

  return {
    auth,
    config,
    database,
    pool,
  };
}

export function createDependenciesPlugin(dependencies: AppDependencies) {
  return new Elysia({ name: "dependencies" })
    .decorate("auth", dependencies.auth)
    .decorate("config", dependencies.config)
    .decorate("database", dependencies.database)
    .decorate("pool", dependencies.pool);
}
