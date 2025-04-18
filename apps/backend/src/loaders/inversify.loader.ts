import { Container } from "inversify";
import { dayjs } from "@/loaders/dayjs.loader.ts";
import { logger } from "@/loaders/logger.loader.ts";
import { Symbols } from "@/types/symbols.ts";
import { prisma } from "@/loaders/prisma.loader.ts";
import { UserService } from "@/services/user.service.ts";
import { AuthService } from "@/services/auth.service.ts";
import { CodeService } from "@/services/code.service.ts";
import { FileService } from "@/services/file.service.ts";
import { FolderService } from "@/services/folder.service.ts";
import { EmailService } from "@/services/email.service.ts";
import { AdminService } from "@/services/admin.service.ts";
import { S3Service } from "@/services/s3.service.ts";

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
container.bind(S3Service).toSelf();

inversifyLogger.info("Inversify loaded successfully");
