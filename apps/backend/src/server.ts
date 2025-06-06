import "reflect-metadata";
import { type Server } from "node:http";
import type express from "express";
import { env } from "#loaders/env.loader";
import { expressLoader } from "#loaders/express.loader";
import { logger } from "#loaders/logger.loader";
import { initializeCronJobs, stopCronJobs } from "#loaders/cron.loader";

let server: Server;

function load(): express.Application {
  logger.info("Loading application...");

  const app = expressLoader();

  logger.info("Application loaded successfully");
  return app;
}

function startServer(app: express.Application): void {
  server = app.listen(env.APP_BACKEND_PORT, () => {
    logger.info(`Server listening on port: ${env.APP_BACKEND_PORT}`);
    logger.info(`Currently running on ${env.MODE} mode.`);

    // Initialize cron jobs after server starts
    initializeCronJobs();
  });

  server.on("error", (error) => {
    logger.error(error.message);
    process.exit(1);
  });
}

const app = load();
startServer(app);

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  stopCronJobs();
  server.close(() => {
    logger.info("Process terminated");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  stopCronJobs();
  server.close(() => {
    logger.info("Process terminated");
    process.exit(0);
  });
});
