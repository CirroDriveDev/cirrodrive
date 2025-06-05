import { injectable, inject } from "inversify";
import type { Logger } from "pino";
import cron, { ScheduledTask } from "node-cron";
import { Symbols } from "#types/symbols";

export interface CronJobConfig {
  name: string;
  schedule: string;
  handler: () => Promise<void> | void;
  enabled?: boolean;
}

@injectable()
export class CronSchedulerService {
  private jobs = new Map<string, ScheduledTask>();

  constructor(@inject(Symbols.Logger) private logger: Logger) {
    this.logger = logger.child({ serviceName: "CronSchedulerService" });
  }

  public scheduleJob(config: CronJobConfig): void {
    const { name, schedule, handler, enabled = true } = config;

    if (!enabled) {
      this.logger.info({ jobName: name }, "Cron job is disabled");
      return;
    }

    if (this.jobs.has(name)) {
      this.logger.warn({ jobName: name }, "Cron job already exists, skipping");
      return;
    }

    if (!cron.validate(schedule)) {
      this.logger.error(
        { jobName: name, schedule },
        "Invalid cron schedule format",
      );
      throw new Error(`Invalid cron schedule: ${schedule}`);
    }

    const task = cron.schedule(schedule, async () => {
      try {
        this.logger.info({ jobName: name }, "Starting cron job execution");
        await handler();
        this.logger.info({ jobName: name }, "Cron job completed successfully");
      } catch (error) {
        this.logger.error(
          { err: error, jobName: name },
          "Cron job execution failed",
        );
      }
    });

    this.jobs.set(name, task);
    void task.start();

    this.logger.info(
      { jobName: name, schedule },
      "Cron job scheduled successfully",
    );
  }

  public unscheduleJob(name: string): boolean {
    const task = this.jobs.get(name);
    if (!task) {
      this.logger.warn({ jobName: name }, "Cron job not found");
      return false;
    }

    void task.stop();
    void task.destroy();
    this.jobs.delete(name);

    this.logger.info({ jobName: name }, "Cron job unscheduled successfully");
    return true;
  }

  public getJobStatus(name: string): { exists: boolean; running?: boolean } {
    const task = this.jobs.get(name);
    if (!task) {
      return { exists: false };
    }

    return {
      exists: true,
      running: task.getStatus() === "scheduled",
    };
  }

  public getAllJobs(): string[] {
    return Array.from(this.jobs.keys());
  }

  public stopAllJobs(): void {
    for (const [name, task] of this.jobs) {
      void task.stop();
      void task.destroy();
      this.logger.info({ jobName: name }, "Cron job stopped");
    }
    this.jobs.clear();
    this.logger.info("All cron jobs stopped");
  }
}
