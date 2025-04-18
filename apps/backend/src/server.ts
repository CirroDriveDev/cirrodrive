import "reflect-metadata";
import { type Server } from "node:http";
import type express from "express";
import { expressLoader } from "@/loaders/express.loader.ts";
import { logger } from "@/loaders/logger.loader.ts";
import { env } from "@/loaders/env.loader.ts";

let server: Server;

function load(): express.Application {
  logger.info("Loading application...");

  const app = expressLoader();

  logger.info("Application loaded successfully");
  return app;
}

function startServer(app: express.Application): void {
  server = app.listen(env.SERVER_PORT, () => {
    logger.info(`Server listening on port: ${env.SERVER_PORT}`);
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
 * 개발 모드를 위한 HMR(Hot Module Replacement) 설정 변경 사항이 발생하면 서버를 닫고 다시 시작합니다.
 */
if (import.meta.hot) {
  const closeServer = (): void => {
    server.close();
  };

  import.meta.hot.dispose(closeServer);
  import.meta.hot.accept();
}
