import { createApp } from "./app";

const { app, dependencies } = createApp();

app.listen({
  hostname: dependencies.config.server.host,
  port: dependencies.config.server.port,
});

console.log(
  `elysia-stack API listening on http://${dependencies.config.server.host}:${dependencies.config.server.port}`,
);

const shutdown = async () => {
  await dependencies.pool.end();
  process.exit(0);
};

process.on("SIGINT", () => void shutdown());
process.on("SIGTERM", () => void shutdown());
