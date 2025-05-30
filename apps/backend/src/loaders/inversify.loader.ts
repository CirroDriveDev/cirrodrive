import { Container } from "inversify";
import { PrismaClient } from "@cirrodrive/database/prisma";
import { dayjs } from "#loaders/dayjs.loader";
import { logger } from "#loaders/logger.loader";
import { Symbols } from "#types/symbols";
import { prisma } from "#loaders/prisma.loader";
import { UserService } from "#services/user.service";
import { AuthService } from "#services/auth.service";
import { FileService } from "#services/file.service";
import { FolderService } from "#services/folder.service";
import { EmailService } from "#services/email.service";
import { AdminService } from "#services/admin.service";
import { S3Service } from "#services/s3.service";
import { FileAccessCodeRepository } from "#repositories/file-access-code.repository";
import { FileAccessCodeService } from "#services/file-access-code.service";
import { PlanRepository } from "#repositories/plan.repository";
import { PlanService } from "#services/plan.service";
import { SubscriptionRepository } from "#repositories/subscription.repository";
import { CardRepository } from "#repositories/card.repository";
import { TransactionRepository } from "#repositories/transaction.repository";
import { BillingService } from "#services/billing.service";
import { TossPaymentsService } from "#services/toss-payments.service";
import { SubscriptionHistoryRepository } from "#repositories/subscription-history.repository";
import { PaymentRepository } from "#repositories/payment.repository";
import { UserRepository } from "#repositories/user.repository";
import { FileUploadService } from "#services/file.upload.service";
import { FileMetadataRepository } from "#repositories/file-metadata.repository";
import { AdminUserRepository } from "#repositories/admin-user.repository";
import { AdminSessionRepository } from "#repositories/admin-session.repository";
import { AdminAuthService } from "#services/admin.auth.service";

const inversifyLogger = logger.child({ prefix: "Inversify" });

const container = new Container();

inversifyLogger.info("Loading inversify...");

container.bind(Symbols.Logger).toConstantValue(logger);
container.bind(Symbols.DayJS).toConstantValue(dayjs);

container.bind(Symbols.UserModel).toConstantValue(prisma.user);
container.bind(Symbols.SessionModel).toConstantValue(prisma.session);
container.bind(Symbols.FileMetadataModel).toConstantValue(prisma.fileMetadata);
container.bind(Symbols.FolderModel).toConstantValue(prisma.folder);
container
  .bind(Symbols.VerificationCodeModel)
  .toConstantValue(prisma.verificationCode);

container.bind(PrismaClient).toConstantValue(prisma);

// Repositories
container.bind(FileAccessCodeRepository).toSelf();
container.bind(PlanRepository).toSelf();
container.bind(SubscriptionRepository).toSelf();
container.bind(CardRepository).toSelf();
container.bind(TransactionRepository).toSelf();
container.bind(SubscriptionHistoryRepository).toSelf();
container.bind(PaymentRepository).toSelf();
container.bind(UserRepository).toSelf();
container.bind(FileMetadataRepository).toSelf();
container.bind(AdminUserRepository).toSelf();
container.bind(AdminSessionRepository).toSelf();

// Services
container.bind(UserService).toSelf();
container.bind(AuthService).toSelf();
container.bind(FileAccessCodeService).toSelf();
container.bind(FileService).toSelf();
container.bind(FolderService).toSelf();
container.bind(EmailService).toSelf();
container.bind(AdminService).toSelf();
container.bind(S3Service).toSelf();
container.bind(PlanService).toSelf();
container.bind(BillingService).toSelf();
container.bind(TossPaymentsService).toSelf();
container.bind(FileUploadService).toSelf();
container.bind(AdminAuthService).toSelf();

inversifyLogger.info("Inversify loaded successfully");

export { container };
