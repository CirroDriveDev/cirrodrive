import "dayjs/locale/ko.js";
import dayjs, { locale, extend } from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { logger as baseLogger } from "@/loaders/logger.ts";

const logger = baseLogger.child({ prefix: "dayjs" });
logger.info("Loading Dayjs...");

locale("ko");
extend(utc);
extend(timezone);

dayjs.tz.setDefault("Asia/Seoul");

logger.info("Dayjs is loaded.");
logger.info(`UTC:   ${dayjs().utc().format()}`);
logger.info(`Local: ${dayjs().format()}`);
logger.info(`Seoul: ${dayjs().tz("Asia/Seoul").format()}`);

export { dayjs };
