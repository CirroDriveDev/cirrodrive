import path from "node:path";
import { type TransportTargetOptions } from "pino";
import pino from "pino-http";

const logFilePath = path.join("logs", "app.log");

const loggerConfig = {
  transport: {
    targets: [
      {
        target: "pino/file",
        options: {
          destination: logFilePath,
          mkdir: true,
        },
      },
      {
        target: "pino-pretty",
        options: {
          colorize: true,
          colorizeObjects: true,
          messageFormat:
            "{if requestId}" +
            "\x1b[33m[requestId: {requestId}]\x1b[36m" +
            "{end} " +
            "{if serviceName}" +
            "\x1b[95m[{serviceName}.{methodName}]\x1b[36m" +
            "{end} " +
            "{if prefix}" +
            "\x1b[95m[{prefix}]\x1b[36m" +
            "{end} " +
            "{msg}",
          translateTime: true,
          ignore: "pid,hostname,serviceName,methodName,prefix,requestId",
          sync: true,
        },
        level: "debug",
      },
    ] as TransportTargetOptions[],
  },
};

export const loggerMiddleware = pino(loggerConfig);
export const logger = loggerMiddleware.logger;

if (import.meta.env.DEV) {
  logger.level = "debug";
}
