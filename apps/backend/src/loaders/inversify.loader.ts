import { Container } from "inversify";
import { PrismaClient } from "@cirrodrive/database/prisma";
import { dayjs } from "#loaders/dayjs.loader.js";
import { logger } from "#loaders/logger.loader.js";
import { Symbols } from "#types/symbols.js";
import { prisma } from "#loaders/prisma.loader.js";
import { UserService } from "#services/user.service.js";
import { AuthService } from "#services/auth.service.js";
import { FileService } from "#services/file.service.js";
import { FolderService } from "#services/folder.service.js";
import { EmailService } from "#services/email.service.js";
import { AdminService } from "#services/admin.service.js";
import { S3Service } from "#services/s3.service.js";
import { FileAccessCodeRepository } from "#repositories/file-access-code.repository.js";
import { FileAccessCodeService } from "#services/file-access-code.service.js";
import { PlanRepository } from "#repositories/plan.repository.js";
import { PlanService } from "#services/plan.service.js";
import { SubscriptionRepository } from "#repositories/subscription.repository.js";
import { CardRepository } from "#repositories/card.repository.js";
import { TransactionRepository } from "#repositories/transaction.repository.js";
import { BillingService } from "#services/billing.service.js";
import { TossPaymentsService } from "#services/toss-payments.service.js";
import { SubscriptionHistoryRepository } from "#repositories/subscription-history.repository.js";
import { PaymentRepository } from "#repositories/payment.repository.js";
import { UserRepository } from "#repositories/user.repository.js";

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

inversifyLogger.info("Inversify loaded successfully");

export { container };
