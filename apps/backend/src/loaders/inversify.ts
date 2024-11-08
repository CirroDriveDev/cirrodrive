import { Container } from "inversify";
import { dayjs } from "@/loaders/dayjs.ts";
import { logger } from "@/loaders/logger.ts";
import { Symbols } from "@/types/symbols.ts";
import { prisma } from "@/loaders/prisma.ts";
import { UserService } from "@/services/userService.ts";
import { AuthService } from "@/services/authService.ts";

const inversifyLogger = logger.child({ prefix: "Inversify" });

export const container = new Container();

inversifyLogger.info("Loading inversify...");

container.bind(Symbols.Logger).toConstantValue(logger);
container.bind(Symbols.DayJS).toConstantValue(dayjs);

container.bind(Symbols.UserModel).toConstantValue(prisma.user);
container.bind(Symbols.SessionModel).toConstantValue(prisma.session);
container.bind(Symbols.CodeModel).toConstantValue(prisma.code);
container.bind(Symbols.FileModel).toConstantValue(prisma.file);

container.bind(UserService).toSelf();
container.bind(AuthService).toSelf();

inversifyLogger.info("Inversify loaded successfully");
