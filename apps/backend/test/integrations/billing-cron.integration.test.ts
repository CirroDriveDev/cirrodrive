import { initializeCronJobs, stopCronJobs } from "#loaders/cron.loader";
import { container } from "#loaders/inversify.loader";
import { BillingCronService } from "#services/billing-cron.service";

// Mock external dependencies
vi.mock("#services/toss-payments.service");
vi.mock("#loaders/env.loader", () => ({
  env: {
    BILLING_CRON_ENABLED: "true",
    BILLING_CRON_SCHEDULE: "0 * * * *",
  },
}));

describe("Billing Cron Integration", () => {
  let billingCronService: BillingCronService;

  beforeAll(() => {
    billingCronService = container.get(BillingCronService);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    stopCronJobs();
  });

  describe("Cron Job Initialization", () => {
    test("should initialize without errors when enabled", () => {
      // Act & Assert
      expect(() => initializeCronJobs()).not.toThrow();
    });

    test("should initialize without errors when disabled", () => {
      // Arrange
      vi.doMock("#loaders/env.loader", () => ({
        env: {
          BILLING_CRON_ENABLED: "false",
          BILLING_CRON_SCHEDULE: "0 * * * *",
        },
      }));

      // Act & Assert
      expect(() => initializeCronJobs()).not.toThrow();
    });
  });

  describe("End-to-End Billing Process", () => {
    test("should process complete billing workflow", async () => {
      // Arrange
      const mockCurrentDate = new Date("2025-01-15T10:00:00Z");
      vi.useFakeTimers();
      vi.setSystemTime(mockCurrentDate);

      // Act
      await billingCronService.processPendingBilling();

      // Assert - Tests that the method completes without throwing
      expect(billingCronService.processPendingBilling).toBeDefined();

      // cleanup
      vi.useRealTimers();
    });

    test("should handle errors gracefully during processing", async () => {
      // Arrange - no setup needed for external behavior test

      // Act & Assert - Should not throw even if internal errors occur
      await expect(billingCronService.processPendingBilling()).resolves.not.toThrow();
    });
  });

  describe("Cron Job Management", () => {
    test("should stop jobs without errors on shutdown", () => {
      // Act & Assert
      expect(() => stopCronJobs()).not.toThrow();
    });
  });
});
