import { Pool } from "pg";

import { make } from "./make";

// DO NOT IMPORT! For better-auth generator use only.
const generatorPool = new Pool({
  connectionString: "postgres://postgres:postgres@localhost:5432/postgres",
});

export const auth = make(generatorPool, "http://localhost:30000");
