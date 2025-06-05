import cron, { type ScheduledTask } from "node-cron";
import { CronSchedulerService } from "#services/cron-scheduler.service";
import { createMockLogger } from "#test/test-utils/create-mock-logger";

vi.mock("node-cron", () => ({
  default: {
    schedule: vi.fn(),
    validate: vi.fn(),
  },
}));

describe("CronSchedulerService", () => {
  let cronSchedulerService: CronSchedulerService;
  const mockLogger = createMockLogger();
  const mockChildLogger = createMockLogger();
  const mockTask = {
    start: vi.fn(),
    stop: vi.fn(),
    destroy: vi.fn(),
    getStatus: vi.fn(),
    id: "test-task-id",
    execute: vi.fn(),
    getNextRun: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    once: vi.fn(),
  } satisfies Partial<ScheduledTask> as ScheduledTask;

  beforeEach(() => {
    mockLogger.child = vi.fn().mockReturnValue(mockChildLogger);
    cronSchedulerService = new CronSchedulerService(mockLogger);
    vi.clearAllMocks();
  });

  describe("scheduleJob", () => {
    test("should schedule a valid cron job successfully", () => {
      // Arrange
      const config = {
        name: "test-job",
        schedule: "0 * * * *",
        handler: vi.fn(),
        enabled: true,
      };

      vi.mocked(cron.validate).mockReturnValue(true);
      vi.mocked(cron.schedule).mockReturnValue(mockTask);

      // Act
      cronSchedulerService.scheduleJob(config);

      // Assert
      expect(cron.validate).toHaveBeenCalledWith("0 * * * *");
      expect(cron.schedule).toHaveBeenCalledWith(
        "0 * * * *",
        expect.any(Function),
      );
      expect(mockTask.start).toHaveBeenCalled();
      expect(mockChildLogger.info).toHaveBeenCalledWith(
        { jobName: "test-job", schedule: "0 * * * *" },
        "Cron job scheduled successfully",
      );
    });

    test("should not schedule job when disabled", () => {
      // Arrange
      const config = {
        name: "disabled-job",
        schedule: "0 * * * *",
        handler: vi.fn(),
        enabled: false,
      };

      // Act
      cronSchedulerService.scheduleJob(config);

      // Assert
      expect(cron.schedule).not.toHaveBeenCalled();
      expect(mockChildLogger.info).toHaveBeenCalledWith(
        { jobName: "disabled-job" },
        "Cron job is disabled",
      );
    });

    test("should not schedule job when it already exists", () => {
      // Arrange
      const config = {
        name: "duplicate-job",
        schedule: "0 * * * *",
        handler: vi.fn(),
      };

      vi.mocked(cron.validate).mockReturnValue(true);
      vi.mocked(cron.schedule).mockReturnValue(mockTask);

      // Act
      // Schedule the job twice
      cronSchedulerService.scheduleJob(config);
      cronSchedulerService.scheduleJob(config);

      // Assert
      expect(cron.schedule).toHaveBeenCalledTimes(1);
      expect(mockChildLogger.warn).toHaveBeenCalledWith(
        { jobName: "duplicate-job" },
        "Cron job already exists, skipping",
      );
    });

    test("should throw error for invalid cron schedule", () => {
      // Arrange
      const config = {
        name: "invalid-job",
        schedule: "invalid-schedule",
        handler: vi.fn(),
      };

      vi.mocked(cron.validate).mockReturnValue(false);

      // Act & Assert
      expect(() => cronSchedulerService.scheduleJob(config)).toThrow(
        "Invalid cron schedule: invalid-schedule",
      );
      expect(mockChildLogger.error).toHaveBeenCalledWith(
        { jobName: "invalid-job", schedule: "invalid-schedule" },
        "Invalid cron schedule format",
      );
    });

    test("should handle job execution success", async () => {
      // Arrange
      const handler = vi.fn().mockResolvedValue(undefined);
      const config = {
        name: "success-job",
        schedule: "0 * * * *",
        handler,
      };

      vi.mocked(cron.validate).mockReturnValue(true);

      let cronCallback: () => Promise<void>;
      vi.mocked(cron.schedule).mockImplementation((_schedule, callback) => {
        cronCallback = callback as () => Promise<void>;
        return mockTask;
      });

      // Act
      cronSchedulerService.scheduleJob(config);
      await cronCallback!();

      // Assert
      expect(handler).toHaveBeenCalled();
      expect(mockChildLogger.info).toHaveBeenCalledWith(
        { jobName: "success-job" },
        "Starting cron job execution",
      );
      expect(mockChildLogger.info).toHaveBeenCalledWith(
        { jobName: "success-job" },
        "Cron job completed successfully",
      );
    });

    test("should handle job execution error", async () => {
      // Arrange
      const error = new Error("Job execution failed");
      const handler = vi.fn().mockRejectedValue(error);
      const config = {
        name: "error-job",
        schedule: "0 * * * *",
        handler,
      };

      vi.mocked(cron.validate).mockReturnValue(true);

      let cronCallback: () => Promise<void>;
      vi.mocked(cron.schedule).mockImplementation((_schedule, callback) => {
        cronCallback = callback as () => Promise<void>;
        return mockTask;
      });

      // Act
      cronSchedulerService.scheduleJob(config);
      await cronCallback!();

      // Assert
      expect(handler).toHaveBeenCalled();
      expect(mockChildLogger.error).toHaveBeenCalledWith(
        { err: error, jobName: "error-job" },
        "Cron job execution failed",
      );
    });
  });

  describe("unscheduleJob", () => {
    test("should unschedule existing job successfully", () => {
      // Arrange
      const config = {
        name: "test-job",
        schedule: "0 * * * *",
        handler: vi.fn(),
      };

      vi.mocked(cron.validate).mockReturnValue(true);
      vi.mocked(cron.schedule).mockReturnValue(mockTask);

      cronSchedulerService.scheduleJob(config);

      // Act
      const result = cronSchedulerService.unscheduleJob("test-job");

      // Assert
      expect(result).toBe(true);
      expect(mockTask.stop).toHaveBeenCalled();
      expect(mockTask.destroy).toHaveBeenCalled();
      expect(mockChildLogger.info).toHaveBeenCalledWith(
        { jobName: "test-job" },
        "Cron job unscheduled successfully",
      );
    });

    test("should return false for non-existent job", () => {
      // Act
      const result = cronSchedulerService.unscheduleJob("non-existent");

      // Assert
      expect(result).toBe(false);
      expect(mockChildLogger.warn).toHaveBeenCalledWith(
        { jobName: "non-existent" },
        "Cron job not found",
      );
    });
  });

  describe("getJobStatus", () => {
    test("should return status for existing job", () => {
      // Arrange
      const config = {
        name: "test-job",
        schedule: "0 * * * *",
        handler: vi.fn(),
      };

      vi.mocked(cron.validate).mockReturnValue(true);
      vi.mocked(cron.schedule).mockReturnValue(mockTask);
      vi.mocked(mockTask.getStatus).mockReturnValue("scheduled");

      cronSchedulerService.scheduleJob(config);

      // Act
      const status = cronSchedulerService.getJobStatus("test-job");

      // Assert
      expect(status).toEqual({ exists: true, running: true });
    });

    test("should return non-existent status for missing job", () => {
      // Act
      const status = cronSchedulerService.getJobStatus("missing-job");

      // Assert
      expect(status).toEqual({ exists: false });
    });
  });

  describe("getAllJobs", () => {
    test("should return all scheduled job names", () => {
      // Arrange
      const jobs = [
        { name: "job1", schedule: "0 * * * *", handler: vi.fn() },
        { name: "job2", schedule: "30 * * * *", handler: vi.fn() },
      ];

      vi.mocked(cron.validate).mockReturnValue(true);
      vi.mocked(cron.schedule).mockReturnValue(mockTask);

      jobs.forEach((job) => cronSchedulerService.scheduleJob(job));

      // Act
      const allJobs = cronSchedulerService.getAllJobs();

      // Assert
      expect(allJobs).toEqual(["job1", "job2"]);
    });

    test("should return empty array when no jobs scheduled", () => {
      // Act
      const allJobs = cronSchedulerService.getAllJobs();

      // Assert
      expect(allJobs).toEqual([]);
    });
  });

  describe("stopAllJobs", () => {
    test("should stop and destroy all scheduled jobs", () => {
      // Arrange
      const jobs = [
        { name: "job1", schedule: "0 * * * *", handler: vi.fn() },
        { name: "job2", schedule: "30 * * * *", handler: vi.fn() },
      ];

      vi.mocked(cron.validate).mockReturnValue(true);
      vi.mocked(cron.schedule).mockReturnValue(mockTask);

      jobs.forEach((job) => cronSchedulerService.scheduleJob(job));

      // Act
      cronSchedulerService.stopAllJobs();

      // Assert
      expect(mockTask.stop).toHaveBeenCalledTimes(2);
      expect(mockTask.destroy).toHaveBeenCalledTimes(2);
      expect(mockChildLogger.info).toHaveBeenCalledWith(
        { jobName: "job1" },
        "Cron job stopped",
      );
      expect(mockChildLogger.info).toHaveBeenCalledWith(
        { jobName: "job2" },
        "Cron job stopped",
      );
      expect(mockChildLogger.info).toHaveBeenCalledWith(
        "All cron jobs stopped",
      );
      expect(cronSchedulerService.getAllJobs()).toEqual([]);
    });
  });
});
