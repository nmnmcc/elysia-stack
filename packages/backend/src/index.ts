import { createApp } from "./app";

const { app, config, pool } = createApp();

app.listen({
  hostname: config.server.host,
  port: config.server.port,
});

console.log(`elysia-stack API listening on http://${config.server.host}:${config.server.port}`);

const shutdown = async () => {
  await pool.end();
  process.exit(0);
};

process.on("SIGINT", () => void shutdown());
process.on("SIGTERM", () => void shutdown());
