import { $Enums } from "@cirrodrive/database/prisma";
import { BillingCronService } from "#services/billing-cron.service";
import { createMockLogger } from "#test/test-utils/create-mock-logger";
import { createMock } from "#test/test-utils/create-mock";
import type { SubscriptionRepository } from "#repositories/subscription.repository";
import type { PaymentService } from "#services/payment.service";
import type { SubscriptionService } from "#services/subscription.service";

// Mock all dependencies that require environment setup
vi.mock("#loaders/dayjs.loader", () => ({
  dayjs: vi.fn(() => ({
    isBefore: vi.fn(),
    add: vi.fn(() => ({
      toDate: vi.fn(() => new Date("2025-01-15T10:00:00Z")),
    })),
    toDate: vi.fn(() => new Date("2025-01-15T10:00:00Z")),
  })),
}));

vi.mock("#decorators/transactional", () => ({
  Transactional:
    () =>
    (_target: unknown, _propertyKey: string, descriptor: PropertyDescriptor) =>
      descriptor,
}));

describe("BillingCronService", () => {
  let billingCronService: BillingCronService;
  const mockLogger = createMockLogger();
  const mockChildLogger = createMockLogger();
  const mockSubscriptionRepository = createMock<SubscriptionRepository>();
  const mockPaymentService = createMock<PaymentService>();
  const mockSubscriptionService = createMock<SubscriptionService>();

  beforeEach(() => {
    mockLogger.child = vi.fn().mockReturnValue(mockChildLogger);
    billingCronService = new BillingCronService(
      mockLogger,
      mockSubscriptionRepository,
      mockPaymentService,
      mockSubscriptionService,
    );
    vi.clearAllMocks();
  });

  describe("processPendingBilling", () => {
    test("should process pending billing successfully", async () => {
      // Arrange
      const mockSubscriptions = [
        {
          id: "sub-1",
          userId: "user-1",
          planId: "plan-1",
          billingId: "billing-1",
          status: "ACTIVE" as const,
          startedAt: new Date("2024-12-15T10:00:00Z"),
          expiresAt: new Date("2025-02-15T10:00:00Z"),
          nextBillingAt: new Date("2025-01-15T10:00:00Z"),
          canceledAt: null,
          cancellationReason: null,
          trialEndsAt: null,
          plan: {
            id: "plan-1",
            name: "Basic Plan",
            description: "Basic subscription plan",
            price: 1000,
            interval: "MONTHLY" as const,
            intervalCount: 1,
            durationDays: 30,
            storageLimit: BigInt(1000000),
            trialDays: 7,
            isDefault: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          billing: {
            id: "billing-1",
            userId: "user-1",
            status: $Enums.BillingStatus.VALID,
            createdAt: new Date(),
            updatedAt: new Date(),
            mId: "mock-mid-1",
            customerKey: "mock-customer-key-1",
            authenticatedAt: new Date(),
            method: "CARD" as const,
            billingKey: "mock-billing-key-1",
            cardIssuerCode: "MOCK_ISSUER",
            cardAcquirerCode: "MOCK_ACQUIRER",
            cardNumber: "1234****",
            cardType: "CREDIT" as const,
            cardOwnerType: "PERSONAL" as const,
            cardCompany: "MOCK_CARD_COMPANY",
            priority: 1,
          },
          user: {
            id: "user-1",
            username: "testuser1",
            hashedPassword: "hashed_password_1",
            email: "user1@test.com",
            currentPlanId: "plan-1",
            usedStorage: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            isAdmin: false,
            trialUsed: false,
            rootFolderId: "root-folder-1",
            trashFolderId: "trash-folder-1",
            profileImageUrl: null,
          },
        },
        {
          id: "sub-2",
          userId: "user-2",
          planId: "plan-2",
          billingId: "billing-2",
          status: "TRIAL" as const,
          startedAt: new Date("2025-01-01T10:00:00Z"),
          expiresAt: new Date("2025-02-01T10:00:00Z"),
          nextBillingAt: new Date("2025-01-15T10:00:00Z"),
          canceledAt: null,
          cancellationReason: null,
          trialEndsAt: new Date("2025-01-10T10:00:00Z"),
          plan: {
            id: "plan-2",
            name: "Premium Plan",
            description: "Premium subscription plan",
            price: 2000,
            interval: "MONTHLY" as const,
            intervalCount: 1,
            durationDays: 30,
            storageLimit: BigInt(5000000),
            trialDays: 14,
            isDefault: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          billing: {
            id: "billing-2",
            userId: "user-2",
            status: $Enums.BillingStatus.VALID,
            createdAt: new Date(),
            updatedAt: new Date(),
            mId: "mock-mid-2",
            customerKey: "mock-customer-key-2",
            authenticatedAt: new Date(),
            method: "CARD" as const,
            billingKey: "mock-billing-key-2",
            cardIssuerCode: "MOCK_ISSUER",
            cardAcquirerCode: "MOCK_ACQUIRER",
            cardNumber: "5678****",
            cardType: "CREDIT" as const,
            cardOwnerType: "PERSONAL" as const,
            cardCompany: "MOCK_CARD_COMPANY",
            priority: 1,
          },
          user: {
            id: "user-2",
            username: "testuser2",
            hashedPassword: "hashed_password_2",
            email: "user2@test.com",
            currentPlanId: "plan-2",
            usedStorage: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            isAdmin: false,
            trialUsed: false,
            rootFolderId: "root-folder-2",
            trashFolderId: "trash-folder-2",
            profileImageUrl: null,
          },
        },
      ];

      mockSubscriptionRepository.findSubscriptionsDueForBilling.mockResolvedValue(
        mockSubscriptions,
      );
      mockPaymentService.charge.mockResolvedValue(undefined);
      mockSubscriptionRepository.updateById.mockResolvedValue(
        mockSubscriptions[0],
      );

      // Act
      await billingCronService.processPendingBilling();

      // Assert
      expect(
        mockSubscriptionRepository.findSubscriptionsDueForBilling,
      ).toHaveBeenCalledWith(expect.any(Date));
      expect(mockChildLogger.info).toHaveBeenCalledWith(
        { count: 2 },
        "Found subscriptions due for billing",
      );
      expect(mockChildLogger.info).toHaveBeenCalledWith(
        "Periodic billing process completed successfully",
      );
    });

    test("should handle errors during billing process", async () => {
      // Arrange
      const error = new Error("Database connection failed");
      mockSubscriptionRepository.findSubscriptionsDueForBilling.mockRejectedValue(
        error,
      );

      // Act & Assert
      await expect(billingCronService.processPendingBilling()).rejects.toThrow(
        "Database connection failed",
      );
      expect(mockChildLogger.error).toHaveBeenCalledWith(
        { err: error },
        "Error occurred during periodic billing process",
      );
    });

    test("should process subscriptions with no due billing", async () => {
      // Arrange
      mockSubscriptionRepository.findSubscriptionsDueForBilling.mockResolvedValue(
        [],
      );

      // Act
      await billingCronService.processPendingBilling();

      // Assert
      expect(mockChildLogger.info).toHaveBeenCalledWith(
        { count: 0 },
        "Found subscriptions due for billing",
      );
      expect(mockChildLogger.info).toHaveBeenCalledWith(
        "Periodic billing process completed successfully",
      );
    });
  });
});
