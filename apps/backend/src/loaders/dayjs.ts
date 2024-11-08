import "dayjs/locale/ko.js";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { logger as baseLogger } from "@/loaders/logger.ts";

const logger = baseLogger.child({ prefix: "dayjs" });
logger.info("Loading Dayjs...");

dayjs.locale("ko");
dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.tz.setDefault("Asia/Seoul");

logger.info("Dayjs is loaded.");
logger.info(`UTC:   ${dayjs().utc().format()}`);
logger.info(`Local: ${dayjs().format()}`);
logger.info(`Seoul: ${dayjs().tz("Asia/Seoul").format()}`);

export { dayjs };
