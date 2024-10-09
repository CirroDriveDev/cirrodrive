import { Container } from "inversify";
import { dayjs } from "@/loaders/dayjs.ts";
import { logger } from "@/loaders/logger.ts";
import { lucia } from "@/loaders/lucia.ts";
import { Symbols } from "@/types/symbols.ts";
import { prisma } from "@/loaders/prisma.ts";
import { UserService } from "@/services/userService.ts";
import { UserValidationService } from "@/services/userValidationService.ts";

const inversifyLogger = logger.child({ prefix: "Inversify" });

export const container = new Container();

inversifyLogger.info("Loading inversify...");

container.bind(Symbols.Logger).toConstantValue(logger);
container.bind(Symbols.Lucia).toConstantValue(lucia);
container.bind(Symbols.DayJS).toConstantValue(dayjs);

container.bind(Symbols.UserModel).toConstantValue(prisma.user);

container.bind(UserService).toSelf();
container.bind(UserValidationService).toSelf();

inversifyLogger.info("Inversify loaded successfully");
