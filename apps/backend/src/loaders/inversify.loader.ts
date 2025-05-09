import { Container } from "inversify";
import { PrismaClient } from "@cirrodrive/database";
import { dayjs } from "@/loaders/dayjs.loader.ts";
import { logger } from "@/loaders/logger.loader.ts";
import { Symbols } from "@/types/symbols.ts";
import { prisma } from "@/loaders/prisma.loader.ts";
import { UserService } from "@/services/user.service.ts";
import { AuthService } from "@/services/auth.service.ts";
import { EmailService } from "@/services/email.service.ts";
import { AdminService } from "@/services/admin.service.ts";
import { S3Service } from "@/services/s3.service.ts";
import { FileRepository } from "@/repositories/file.repository.ts";
import { FileDomainService } from "@/services/file-domain.service.ts";
import { FileAccessCodeRepository } from "@/repositories/file-access-code.repository.ts";
import { FileAccessCodeService } from "@/services/file-access-code.service.ts";
import { FileService } from "@/services/file.service.ts";

const inversifyLogger = logger.child({ prefix: "Inversify" });

const container = new Container();

inversifyLogger.info("Loading inversify...");

container.bind(Symbols.Logger).toConstantValue(logger);
container.bind(Symbols.DayJS).toConstantValue(dayjs);

container.bind(Symbols.UserModel).toConstantValue(prisma.user);
container.bind(Symbols.SessionModel).toConstantValue(prisma.session);
container.bind(Symbols.FileModel).toConstantValue(prisma.file);
container
  .bind(Symbols.FileAccessCodeModel)
  .toConstantValue(prisma.fileAccessCode);
container
  .bind(Symbols.VerificationCodeModel)
  .toConstantValue(prisma.verificationCode);

container.bind(PrismaClient).toConstantValue(prisma);
container.bind(FileRepository).toSelf();
container.bind(FileAccessCodeRepository).toSelf();

container.bind(UserService).toSelf();
container.bind(AuthService).toSelf();
container.bind(FileAccessCodeService).toSelf();
container.bind(FileDomainService).toSelf();
container.bind(FileService).toSelf();
container.bind(EmailService).toSelf();
container.bind(AdminService).toSelf();
container.bind(S3Service).toSelf();

inversifyLogger.info("Inversify loaded successfully");

export { container };
