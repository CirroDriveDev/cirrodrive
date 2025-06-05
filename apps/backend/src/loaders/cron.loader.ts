import { container } from "#loaders/inversify.loader";
import { logger } from "#loaders/logger.loader";
import { env } from "#loaders/env.loader";
import { CronSchedulerService } from "#services/cron-scheduler.service";
import { BillingCronService } from "#services/billing-cron.service";

const cronLogger = logger.child({ prefix: "CronLoader" });

export function initializeCronJobs(): void {
  cronLogger.info("Initializing cron jobs...");

  try {
    const cronScheduler = container.get(CronSchedulerService);
    const billingCronService = container.get(BillingCronService);

    // Schedule billing job - runs every hour at minute 0
    cronScheduler.scheduleJob({
      name: "billing-processor",
      schedule: env.BILLING_CRON_SCHEDULE || "0 * * * *",
      handler: () => billingCronService.processPendingBilling(),
      enabled: env.BILLING_CRON_ENABLED !== "false",
    });

    cronLogger.info("Cron jobs initialized successfully");
  } catch (error) {
    cronLogger.error({ err: error }, "Failed to initialize cron jobs");
    throw error;
  }
}

export function stopCronJobs(): void {
  cronLogger.info("Stopping cron jobs...");

  try {
    const cronScheduler = container.get(CronSchedulerService);
    cronScheduler.stopAllJobs();
    cronLogger.info("Cron jobs stopped successfully");
  } catch (error) {
    cronLogger.error({ err: error }, "Failed to stop cron jobs");
  }
}