import "reflect-metadata";
import type express from "express";
import { expressLoader } from "@/loaders/express.ts";
import { logger } from "@/loaders/logger.ts";
import { prisma } from "@/loaders/prisma.ts";

await prisma.user.findMany();

function load(): express.Application {
  logger.info("Loading application...");

  const app = expressLoader();

  logger.info("Application loaded successfully");
  return app;
}

function startServer(app: express.Application): void {
  const server = app.listen(import.meta.env.VITE_PORT, () => {
    logger.info(`Server listening on port: ${import.meta.env.VITE_PORT}`);
    logger.info(`Currently running on ${import.meta.env.MODE} mode.`);
  });

  server.on("error", (error) => {
    logger.error(error.message);
    process.exit(1);
  });
}

if (import.meta.hot) {
  logger.debug("Server hot module replacement enabled.");
}

const app = load();
startServer(app);

/**
 * Hot module replacement for development mode.
 * Automatically reloads the server when changes are made.
 */
if (import.meta.hot) {
  /**
   * Closes the server and reloads it when changes are made.
   */
  const closeServer = (): never => {
    logger.debug("--------------------");
    logger.debug("Reloading server...");
    logger.debug("--------------------");
    process.exit(0);
  };

  import.meta.hot.on("vite:beforeUpdate", closeServer);
  import.meta.hot.accept();
}
