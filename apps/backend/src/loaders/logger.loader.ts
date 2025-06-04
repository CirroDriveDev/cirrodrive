import path from "node:path";
import { type IncomingMessage, type ServerResponse } from "node:http";
import { pinoHttp } from "pino-http";
import { nanoid } from "nanoid";
import { env } from "#loaders/env.loader";

const logFilePath = path.join("logs", "app.log");

export const loggerMiddleware = pinoHttp({
  genReqId: () => nanoid(8),
  customSuccessMessage: (req, _res) => {
    const message = `Handled ${req.method} ${req.url}`;
    return message;
  },
  customErrorMessage: (req, _res, error) =>
    `Error in ${req.method} ${req.url}: ${error.message}`,
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 500 || err) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  serializers: {
    req(req: IncomingMessage) {
      return {
        method: req.method,
        url: req.url,
        id: req.id, // traceId
      };
    },
    res(res: ServerResponse) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
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
            "{if traceId}" +
            "\x1b[33m[{traceId}]\x1b[36m" +
            "{end} " +
            "{if serviceName}" +
            "\x1b[95m[{serviceName}.{methodName}]\x1b[36m" +
            "{end} " +
            "{if path}" +
            "\x1b[94m<{path}>\x1b[36m" +
            "{end} " +
            "{if prefix}" +
            "\x1b[95m[{prefix}]\x1b[36m" +
            "{end} " +
            "{if component}" +
            "\x1b[95m({component}.{action})\x1b[36m" +
            "{end} " +
            "{msg}",
          translateTime: true,
          ignore:
            "pid,hostname,serviceName,methodName,prefix,requestId" +
            ",traceId,component,action,userId,path",
          sync: true,
        },
        level: "debug",
      },
    ],
  },
});
export const logger = loggerMiddleware.logger;

if (env.DEV) {
  logger.level = "debug";
}
