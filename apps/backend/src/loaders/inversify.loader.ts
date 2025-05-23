import { Container } from "inversify";
import { PrismaClient } from "@cirrodrive/database";
import { dayjs } from "@/loaders/dayjs.loader.ts";
import { logger } from "@/loaders/logger.loader.ts";
import { Symbols } from "@/types/symbols.ts";
import { prisma } from "@/loaders/prisma.loader.ts";
import { UserService } from "@/services/user.service.ts";
import { AuthService } from "@/services/auth.service.ts";
import { FileService } from "@/services/file.service.ts";
import { FolderService } from "@/services/folder.service.ts";
import { EmailService } from "@/services/email.service.ts";
import { AdminService } from "@/services/admin.service.ts";
import { S3Service } from "@/services/s3.service.ts";
import { FileAccessCodeRepository } from "@/repositories/file-access-code.repository.ts";
import { FileAccessCodeService } from "@/services/file-access-code.service.ts";
import { PlanRepository } from "@/repositories/plan.repository.ts";
import { PlanService } from "@/services/plan.service.ts";
import { SubscriptionRepository } from "@/repositories/subscription.repository.ts";
import { CardRepository } from "@/repositories/card.repository.ts";
import { TransactionRepository } from "@/repositories/transaction.repository.ts";
import { BillingService } from "@/services/billing.service.ts";
import { TossPaymentsService } from "@/services/toss-payments.service.ts";
import { SubscriptionHistoryRepository } from "@/repositories/subscription-history.repository.ts";
import { PaymentRepository } from "@/repositories/payment.repository.ts";
import { UserRepository } from "@/repositories/user.repository.ts";

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
