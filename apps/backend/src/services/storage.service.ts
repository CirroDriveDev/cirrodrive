import { injectable, inject } from "inversify";
import type { Logger } from "pino";
import { TRPCError } from "@trpc/server";
import { Symbols } from "#types/symbols";
import { PlanService } from "#services/plan.service";
import { FileMetadataRepository } from "#repositories/file-metadata.repository";

/**
 * 스토리지 서비스 - 사용자의 저장소 사용량 관련 기능을 제공합니다.
 */
@injectable()
export class StorageService {
  constructor(
    @inject(Symbols.Logger) private logger: Logger,
    @inject(PlanService) private planService: PlanService,
    @inject(FileMetadataRepository)
    private fileMetadataRepository: FileMetadataRepository,
  ) {
    this.logger = logger.child({ serviceName: "StorageService" });
  }

  /**
   * 사용자의 저장소 사용량 정보를 조회합니다.
   *
   * @param userId - 사용자 ID
   * @returns 저장소 사용량, 할당량, 요금제 ID, 한계 근접 여부
   */
  public async getUsage(userId: string): Promise<{
    used: number;
    quota: number;
    planId: string;
    isNearLimit: boolean;
  }> {
    try {
      this.logger.info(
        { methodName: "getUsage", userId },
        "저장소 사용량 조회 시작",
      );

      // 1. 사용자의 현재 요금제 조회
      const currentPlan = await this.planService.getCurrentPlanByUserId(userId);

      if (!currentPlan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "사용자의 요금제 정보를 찾을 수 없습니다.",
        });
      }

      // 2. 사용자가 업로드한 파일들의 총 크기 계산
      const usedStorage = await this.calculateUsedStorage(userId);

      // 3. 요금제 할당량 (bytes 단위로 변환)
      const quota = currentPlan.storageLimit;

      // 4. 사용량이 90% 이상인지 확인
      const isNearLimit = quota > 0 ? usedStorage / quota >= 0.9 : false;

      this.logger.info(
        {
          methodName: "getUsage",
          userId,
          usedStorage,
          quota,
          planId: currentPlan.id,
          isNearLimit,
        },
        "저장소 사용량 조회 완료",
      );

      return {
        used: usedStorage,
        quota,
        planId: currentPlan.id,
        isNearLimit,
      };
    } catch (error) {
      this.logger.error(
        { methodName: "getUsage", userId, error },
        "저장소 사용량 조회 중 오류 발생",
      );

      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "저장소 사용량을 조회하는 중 오류가 발생했습니다.",
      });
    }
  }

  /**
   * 사용자가 사용한 저장소 크기를 계산합니다.
   *
   * @param userId - 사용자 ID
   * @returns 사용한 저장소 크기 (bytes)
   */
  private async calculateUsedStorage(userId: string): Promise<number> {
    try {
      this.logger.debug(
        { methodName: "calculateUsedStorage", userId },
        "사용 저장소 계산 시작",
      );

      // 사용자가 소유한 모든 파일의 크기 합계 계산
      // 휴지통에 있는 파일도 포함 (실제 스토리지를 차지하므로)
      const result =
        await this.fileMetadataRepository.calculateTotalSizeByOwner(userId);

      this.logger.debug(
        { methodName: "calculateUsedStorage", userId, totalSize: result },
        "사용 저장소 계산 완료",
      );

      return result;
    } catch (error) {
      this.logger.error(
        { methodName: "calculateUsedStorage", userId, error },
        "사용 저장소 계산 중 오류 발생",
      );
      throw error;
    }
  }
}
