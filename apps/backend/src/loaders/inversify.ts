import { Container } from "inversify";
import { dayjs } from "@/loaders/dayjs.ts";
import { logger } from "@/loaders/logger.ts";
import { Symbols } from "@/types/symbols.ts";
import { prisma } from "@/loaders/prisma.ts";
import { UserService } from "@/services/userService.ts";
import { AuthService } from "@/services/authService.ts";
import { CodeService } from "@/services/codeService.ts";
import { FileService } from "@/services/fileService.ts";
import { FolderService } from "@/services/folderService.ts";
import { EmailService } from "@/services/emailService.ts";
import { AdminService } from "@/services/adminService.ts";

const inversifyLogger = logger.child({ prefix: "Inversify" });

export const container = new Container();

inversifyLogger.info("Loading inversify...");

container.bind(Symbols.Logger).toConstantValue(logger);
container.bind(Symbols.DayJS).toConstantValue(dayjs);

container.bind(Symbols.UserModel).toConstantValue(prisma.user);
container.bind(Symbols.SessionModel).toConstantValue(prisma.session);
container.bind(Symbols.CodeModel).toConstantValue(prisma.code);
container.bind(Symbols.FileMetadataModel).toConstantValue(prisma.fileMetadata);
container.bind(Symbols.FolderModel).toConstantValue(prisma.folder);
container
  .bind(Symbols.VerificationCodeModel)
  .toConstantValue(prisma.verificationCode);

container.bind(UserService).toSelf();
container.bind(AuthService).toSelf();
container.bind(CodeService).toSelf();
container.bind(FileService).toSelf();
container.bind(FolderService).toSelf();
container.bind(EmailService).toSelf();
container.bind(AdminService).toSelf();

inversifyLogger.info("Inversify loaded successfully");
