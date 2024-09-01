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
    ] as TransportTargetOptions[],
  },
};

if (import.meta.env.DEV) {
  loggerConfig.transport.targets.push({
    target: "pino-pretty",
    options: {
      colorize: true,
      colorizeObjects: true,
      messageFormat: "{if prefix}\x1b[95m[{prefix}]\x1b[36m {end} {msg}",
      translateTime: true,
      ignore: "hostname,prefix",
      sync: true,
    },
    level: "debug",
  });
} else {
  loggerConfig.transport.targets.push({
    target: "pino/file",
    options: {
      destination: 1, // stdout
      mkdir: false,
    },
  });
}

export const loggerMiddleware = pino(loggerConfig);
export const logger = loggerMiddleware.logger;

if (import.meta.env.DEV) {
  logger.level = "debug";
}
