import { injectable, inject } from "inversify";
import type { Prisma, User, FileMetadata } from "@cirrodrive/database/prisma";
import { hash, verify } from "@node-rs/argon2";
import type { Logger } from "pino";
import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { dayjs } from "#loaders/dayjs.loader";
import { Symbols } from "#types/symbols";
import { env } from "#loaders/env.loader";
import { PlanService } from "#services/plan.service";
import { BillingService } from "#services/billing.service";
import { PaymentService } from "#services/payment.service";

@injectable()
export class AdminService {
  constructor(
    @inject(Symbols.Logger) private logger: Logger,
    @inject(Symbols.UserModel) private userModel: Prisma.UserDelegate,
    @inject(Symbols.FolderModel) private folderModel: Prisma.FolderDelegate,
    @inject(Symbols.FileMetadataModel)
    private fileModel: Prisma.FileMetadataDelegate,
    @inject(PlanService) private planService: PlanService,
    @inject(BillingService) private billingService: BillingService,
    @inject(PaymentService)
    private paymentService: PaymentService,
  ) {
    this.logger = logger.child({ serviceName: "AdminService" });
  }

  /**
   * 새로운 사용자(일반 사용자 또는 관리자)를 생성합니다.
   *
   * 프론트엔드에서 사용자 생성 시:
   *
   * - Username: 텍스트 입력
   * - Password: 텍스트 입력
   * - Email: 텍스트 입력
   * - ProfileImageUrl: 선택적 이미지 URL
   * - UsedStorage: 보통 0으로 초기화
   * - IsAdmin: 관리자 권한 부여 여부 (체크박스, 체크 시 true, 미체크 시 false)
   * - PlanId: 사용자에게 적용할 요금제 ID
   *
   * 관리자 계정 생성을 원할 경우 isAdmin을 true로 설정합니다. 단, 실제 관리자 권한 생성은 호출하는 쪽에서 권한 검증을 반드시
   * 해야 합니다.
   *
   * @param username - 사용자 이름
   * @param password - 비밀번호
   * @param email - 이메일
   * @param profileImageUrl - 프로필 이미지 URL
   * @param usedStorage - 사용된 저장 공간
   * @param isAdmin - 관리자 여부 (true면 관리자 생성)
   * @returns 생성된 사용자
   * @throws 생성 중 오류가 발생한 경우
   */
  public async create({
    username,
    password,
    email,
    profileImageUrl,
    usedStorage,
    isAdmin,
  }: {
    username: string;
    password: string;
    email: string;
    planId: string;
    profileImageUrl: string | null;
    usedStorage: number;
    isAdmin: boolean; // 체크박스 값으로 true/false 전달
  }): Promise<User> {
    try {
      this.logger.info(
        {
          methodName: "create",
          username,
          email,
          isAdmin,
        },
        isAdmin ? "관리자 계정 생성 시작" : "일반 사용자 계정 생성 시작",
      );

      // 관리자 생성 권한 체크 필요 (예시)
      // if (isAdmin && !callerHasAdminRights) {
      //   throw new TRPCError({ code: "FORBIDDEN", message: "관리자 권한이 필요합니다." });
      // }

      const hashedPassword = await hash(password);

      // planId를 직접 받는 게 맞으면 아래 코드로 변경 가능
      const plan = await this.planService.getDefaultPlan();
      // const plan = await this.planService.getPlanById(planId);

      const user = await this.userModel.create({
        data: {
          username,
          email,
          hashedPassword,
          profileImageUrl,
          usedStorage,
          isAdmin,
          rootFolder: {
            create: {
              name: "root",
            },
          },
          trashFolder: {
            create: {
              name: "trash",
            },
          },
          currentPlan: {
            connect: {
              id: plan.id,
            },
          },
        },
      });

      // rootFolder, trashFolder owner 연결
      await this.folderModel.update({
        where: {
          id: user.rootFolderId,
        },
        data: {
          owner: {
            connect: {
              id: user.id,
            },
          },
        },
      });

      await this.folderModel.update({
        where: {
          id: user.trashFolderId,
        },
        data: {
          owner: {
            connect: {
              id: user.id,
            },
          },
        },
      });

      return user;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error.message);
      }
      throw error;
    }
  }
  /**
   * 주어진 ID를 가진 사용자를 삭제합니다.
   *
   * @param userId - 삭제할 유저의 ID
   * @returns 삭제 성공 여부
   * @throws 유저 삭제 중 오류 발생 시
   */
  public async deleteUser(userId: string): Promise<boolean> {
    try {
      this.logger.info({ methodName: "deleteUser", userId }, "유저 삭제 시작");

      const user = await this.userModel.findUnique({
        where: { id: userId },
        include: { rootFolder: true, trashFolder: true },
      });

      if (!user) {
        this.logger.warn({ userId }, "삭제할 유저를 찾을 수 없음");
        return false;
      }

      // 1) 연관된 파일 등도 삭제 (필요하다면)
      await this.fileModel.deleteMany({ where: { ownerId: userId } });

      // 2) 폴더 삭제 (ID를 rootFolder.id, trashFolder.id로 접근)
      if (user.rootFolder) {
        await this.folderModel.delete({ where: { id: user.rootFolder.id } });
      }
      if (user.trashFolder) {
        await this.folderModel.delete({ where: { id: user.trashFolder.id } });
      }

      // 3) 유저 삭제
      await this.userModel.delete({ where: { id: userId } });

      this.logger.info({ userId }, "유저 삭제 완료");
      return true;
    } catch (error) {
      this.logger.error({ error, userId }, "유저 삭제 실패");
      throw error;
    }
  }

  /**
   * 유저 목록을 조회합니다.
   *
   * @param limit - 가져올 유저 수
   * @param offset - 시작 위치
   * @returns 유저 목록
   * @throws 유저 조회 중 오류 발생 시
   */
  public async getUsers({
    limit,
    offset,
  }: {
    limit: number;
    offset: number;
  }): Promise<User[]> {
    try {
      this.logger.info(
        { methodName: "getUsers", limit, offset },
        "유저 목록 조회 시작",
      );

      const users = await this.userModel.findMany({
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
      });

      this.logger.info({ userCount: users.length }, "유저 목록 조회 성공");

      return users;
    } catch (error) {
      this.logger.error({ error }, "유저 목록 조회 실패");
      throw error;
    }
  }
  /**
   * 주어진 ID를 가진 사용자의 정보를 조회합니다.
   *
   * @param userId - 조회할 유저의 ID
   * @returns 조회된 유저 정보
   * @throws 유저 조회 중 오류 발생 시
   */
  public async getUserById(userId: string): Promise<User | null> {
    try {
      this.logger.info({ methodName: "getUserById", userId }, "유저 조회 시작");

      const user = await this.userModel.findUnique({
        where: { id: userId },
      });

      if (!user) {
        this.logger.warn({ userId }, "조회할 유저를 찾을 수 없음");
      } else {
        this.logger.info({ userId }, "유저 조회 성공");
      }

      return user;
    } catch (error) {
      this.logger.error({ error, userId }, "유저 조회 실패");
      throw error;
    }
  }
  /**
   * 주어진 ID를 가진 사용자의 정보를 업데이트합니다.
   *
   * @param userId - 업데이트할 유저의 ID
   * @param data - 업데이트할 정보
   * @returns 업데이트된 유저 정보
   * @throws 유저 업데이트 중 오류 발생 시
   */
  public async updateUser(
    userId: string,
    data: {
      username?: string;
      password?: string;
      email?: string;
      planId?: string;
      profileImageUrl?: string | null;
      usedStorage?: number;
    },
  ): Promise<User> {
    try {
      this.logger.info(
        { methodName: "updateUser", userId },
        "유저 업데이트 시작",
      );

      const existingUser = await this.userModel.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        this.logger.warn({ userId }, "업데이트할 유저를 찾을 수 없음");
        throw new Error("해당 유저를 찾을 수 없습니다.");
      }

      const updateData: Prisma.UserUpdateInput = {
        username: data.username ?? existingUser.username,
        email: data.email ?? existingUser.email,
        currentPlan: data.planId ? { connect: { id: data.planId } } : undefined,
        profileImageUrl: data.profileImageUrl ?? existingUser.profileImageUrl,
        usedStorage: data.usedStorage ?? existingUser.usedStorage,
      };

      if (data.password) {
        updateData.hashedPassword = await hash(data.password);
      }

      const updatedUser = await this.userModel.update({
        where: { id: userId },
        data: updateData,
      });

      this.logger.info({ userId }, "유저 업데이트 성공");
      return updatedUser;
    } catch (error) {
      this.logger.error({ error, userId }, "유저 업데이트 실패");
      throw error;
    }
  }
  /**
   * 파일 목록을 조회합니다.
   *
   * @param limit - 가져올 파일 수
   * @param offset - 시작 위치
   * @param sortBy - 정렬 기준 ('uploadDate' 또는 'owner')
   * @param order - 정렬 순서 ('asc' 또는 'desc')
   * @returns 파일 목록
   * @throws 파일 목록 조회 중 오류 발생 시
   */
  public async getAllUserFiles({
    limit,
    offset,
    sortBy = "uploadDate",
    order = "desc",
  }: {
    limit: number;
    offset: number;
    sortBy?: "uploadDate" | "owner";
    order?: "asc" | "desc";
  }): Promise<FileMetadata[]> {
    try {

      this.logger.info(
        { methodName: "getAllUserFiles", limit, offset, sortBy, order },
        "파일 목록 조회 시작",
      );

      // 파일 목록 조회
      const files = await this.fileModel.findMany({
        take: limit,
        skip: offset,
        orderBy: {
          [sortBy]: order === "desc" ? "desc" : "asc", // 정렬 기준
        },
        include: {
          owner: true, // 소유자 정보 포함
        },
      });

      this.logger.info({ fileCount: files.length }, "파일 목록 조회 성공");

      return files;
    } catch (error) {
      this.logger.error({ error }, "파일 목록 조회 실패");
      throw new Error("파일 목록 조회 중 오류가 발생했습니다.");
    }
  }
  /**
   * 파일을 삭제합니다.
   *
   * @param fileId - 삭제할 파일의 ID
   * @param currentUserId - 현재 관리자 ID (삭제 요청자)
   * @returns 삭제 성공 여부
   * @throws 관리자 권한 없음, 파일 없음, 삭제 실패 시 예외 발생
   */
  public async deleteFile({
    fileId,
    currentUserId,
  }: {
    fileId: string;
    currentUserId: string;
  }): Promise<boolean> {
    try {
      // 관리자 권한 확인
      const user = await this.userModel.findUnique({
        where: { id: currentUserId },
      });

      if (!user?.isAdmin) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "관리자만 파일을 삭제할 수 있습니다.",
        });
      }

      this.logger.info({ methodName: "deleteFile", fileId }, "파일 삭제 시작");

      // 파일 존재 여부 확인
      const file = await this.fileModel.findUnique({
        where: { id: fileId },
      });

      if (!file) {
        this.logger.warn({ fileId }, "삭제할 파일을 찾을 수 없음");
        return false;
      }

      // 메타데이터 삭제
      await this.fileModel.delete({
        where: { id: fileId },
      });

      this.logger.info({ fileId }, "파일 삭제 완료");

      return true;
    } catch (error) {
      this.logger.error({ error, fileId }, "파일 삭제 실패");
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "파일 삭제 중 오류가 발생했습니다.",
      });
    }
  }
  // 특정 기간에 따른 날짜 계산 함수 (private)
  private getStartDate(period: "1d" | "1w" | "6m"): Date {
    const now = dayjs();
    switch (period) {
      case "1d":
        return now.subtract(1, "day").toDate();
      case "1w":
        return now.subtract(1, "week").toDate();
      case "6m":
        return now.subtract(6, "month").toDate();
    }
  }

  /**
   * 특정 기간 동안 가입한 유저 수를 반환합니다.
   *
   * 입력값 (period)에 따라 반환되는 데이터의 집계 단위가 달라집니다.
   *
   * - "1d": 오늘만 집계하여 오늘의 가입자 수를 반환합니다.
   * - "1w": 최근 7일간 (오늘 포함) 매일의 가입자 수를 집계하여 반환합니다.
   * - "6m": 최근 6개월 (이번 달 포함) 동안 각 월의 가입자 수를 집계하여 반환합니다.
   *
   * `반환값은 { signups: { date: string; count: number }[] } 형식입니다.`
   *
   * `@param period 가입 기간 ("1d", "1w", "6m")`
   *
   * `@returns {signups: { date: string; count: number }[]} - 기간별 가입자 수 데이터`
   *
   * @throws 가입 유저 수 집계 중 오류가 발생하면 에러를 던집니다.
   */
  public async getNewUsersCount(
    period: "1d" | "1w" | "6m",
  ): Promise<{ signups: { date: string; count: number }[] }> {
    try {
      switch (period) {
        case "1d": {
          // 오늘만 집계 (하루 데이터)
          const startDate = dayjs().startOf("day").toDate();
          this.logger.info(
            { methodName: "getNewUsersCount", period, startDate },
            "가입 유저 수 조회 시작 (1d)",
          );
          const count = await this.userModel.count({
            where: { createdAt: { gte: startDate } },
          });
          this.logger.info({ period, count }, "가입 유저 수 조회 성공 (1d)");
          // 그래프용 데이터는 [오늘] 한 포인트로 구성
          return { signups: [{ date: dayjs().format("YYYY-MM-DD"), count }] };
        }

        case "1w": {
          // 최근 7일: 오늘을 포함하여 6일 전부터 오늘까지 (하루 단위)
          const startDate = dayjs().subtract(6, "day").startOf("day").toDate();
          this.logger.info(
            { methodName: "getNewUsersCount", period, startDate },
            "가입 유저 수 조회 시작 (1w)",
          );
          const groups = await this.userModel.groupBy({
            by: ["createdAt"],
            where: {
              createdAt: { gte: startDate },
            },
            _count: { id: true },
          });
          // 그룹 결과를 "YYYY-MM-DD" 형식의 맵으로 변환
          const signupMap: Record<string, number> = {};
          groups.forEach((group) => {
            const key = dayjs(group.createdAt).format("YYYY-MM-DD");
            signupMap[key] = group._count.id;
          });
          // 7일치 데이터를 생성 (없으면 0)
          const signups: { date: string; count: number }[] = [];
          for (let i = 6; i >= 0; i--) {
            const dayKey = dayjs().subtract(i, "day").format("YYYY-MM-DD");
            signups.push({ date: dayKey, count: signupMap[dayKey] ?? 0 });
          }
          this.logger.info({ period, signups }, "가입 유저 수 조회 성공 (1w)");
          return { signups };
        }

        case "6m": {
          // 최근 6개월: 이번 달 포함하여, 예를 들어 오늘이 2025-05-xx이면 2024-12 ~ 2025-05까지 집계
          // 시작: 5개월 전의 시작일, 종료: 이번 달 마지막 날
          const startDate = dayjs()
            .subtract(5, "month")
            .startOf("month")
            .toDate();
          const endDate = dayjs().endOf("month").toDate();
          this.logger.info(
            { methodName: "getNewUsersCount", period, startDate, endDate },
            "가입 유저 수 조회 시작 (6m)",
          );

          const groups = await this.userModel.groupBy({
            by: ["createdAt"],
            where: {
              createdAt: { gte: startDate, lte: endDate },
            },
            _count: { id: true },
          });

          // 그룹 결과를 "YYYY-MM" 형식의 맵으로 변환 (동일 월은 누적)
          const signupMap: Record<string, number> = {};
          groups.forEach((group) => {
            const key = dayjs(group.createdAt).format("YYYY-MM");
            signupMap[key] = (signupMap[key] ?? 0) + group._count.id;
          });

          // 지난 6개월 (이번 달 포함) 동안 각 월의 데이터를 생성 (없으면 0)
          const signups: { date: string; count: number }[] = [];
          for (let i = 5; i >= 0; i--) {
            const monthKey = dayjs().subtract(i, "month").format("YYYY-MM");
            signups.push({ date: monthKey, count: signupMap[monthKey] ?? 0 });
          }

          this.logger.info({ period, signups }, "가입 유저 수 조회 성공 (6m)");
          return { signups };
        }

        default: {
          // never 타입 안전 처리
          const _exhaustiveCheck: never = period;
          throw new Error(`Invalid period: ${String(_exhaustiveCheck)}`);
        }
      }
    } catch (error) {
      this.logger.error({ error, period }, "가입 유저 수 조회 실패");
      throw error;
    }
  }

  /**
   * 특정 기간 동안 업로드된 파일 수를 반환합니다.
   *
   * 이 메서드는 입력된 기간(`"1d"`, `"1w"`, `"6m"`)에 따라 파일 업로드 건수를 집계합니다.
   *
   * - `"1d"`: 오늘의 시작 시각부터의 업로드 건수를 집계하여 단일 데이터 포인트를 반환합니다.
   * - `"1w"`: 최근 7일 동안(오늘 포함) 하루 단위 업로드 건수를 집계하여 7개의 데이터 포인트를 반환합니다.
   * - `"6m"`: 최근 6개월 동안(이번 달 포함) 월별 업로드 건수를 집계하여 6개의 데이터 포인트를 반환합니다.
   *
   * @param period - 업로드 수를 집계할 기간. `"1d"`, `"1w"`, `"6m"` 중 하나를 전달합니다.
   * @returns `{ uploads: { date: string; count: number }[] }` - 업로드 건수 데이터가 포함된
   *   객체. 각 배열 원소는 `{ date: string; count: number }` 형식으로, 날짜 또는 월과 해당 기간의 업로드
   *   건수를 나타냅니다.
   * @throws 업로드 수 조회 중 오류가 발생하면 해당 에러를 throw 합니다.
   */
  public async getUploadCount(
    period: "1d" | "1w" | "6m",
  ): Promise<{ uploads: { date: string; count: number }[] }> {
    try {
      switch (period) {
        case "1d": {
          // 오늘만 집계 (하루 데이터)
          const startDate = dayjs().startOf("day").toDate();
          this.logger.info(
            { methodName: "getUploadCount", period, startDate },
            "파일 업로드 수 조회 시작 (1d)",
          );
          const count = await this.fileModel.count({
            where: { createdAt: { gte: startDate } },
          });
          this.logger.info({ period, count }, "파일 업로드 수 조회 성공 (1d)");
          // 그래프용 데이터는 [오늘] 한 포인트로 구성
          return { uploads: [{ date: dayjs().format("YYYY-MM-DD"), count }] };
        }
        case "1w": {
          // 최근 7일: 오늘을 포함하여 6일 전부터 오늘까지 (하루 단위)
          const startDate = dayjs().subtract(6, "day").startOf("day").toDate();
          this.logger.info(
            { methodName: "getUploadCount", period, startDate },
            "파일 업로드 수 조회 시작 (1w)",
          );
          const groups = await this.fileModel.groupBy({
            by: ["createdAt"],
            where: {
              createdAt: { gte: startDate },
            },
            _count: { id: true },
          });
          // 그룹 결과를 "YYYY-MM-DD" 형식의 맵으로 변환
          const uploadMap: Record<string, number> = {};
          groups.forEach((group) => {
            const key = dayjs(group.createdAt).format("YYYY-MM-DD");
            uploadMap[key] = group._count.id;
          });
          // 7일치 데이터를 생성 (없으면 0)
          const uploads: { date: string; count: number }[] = [];
          for (let i = 6; i >= 0; i--) {
            const dayKey = dayjs().subtract(i, "day").format("YYYY-MM-DD");
            uploads.push({ date: dayKey, count: uploadMap[dayKey] ?? 0 });
          }
          this.logger.info(
            { period, uploads },
            "파일 업로드 수 조회 성공 (1w)",
          );
          return { uploads };
        }
        case "6m": {
          // 최근 6개월: 이번 달 포함하여, 예를 들어 오늘이 2025-05-xx이면 2024-12 ~ 2025-05까지 집계
          // 시작: 5개월 전의 시작일, 종료: 이번 달의 마지막 날까지
          const startDate = dayjs()
            .subtract(5, "month")
            .startOf("month")
            .toDate();
          const endDate = dayjs().endOf("month").toDate();
          this.logger.info(
            { methodName: "getUploadCount", period, startDate, endDate },
            "파일 업로드 수 조회 시작 (6m)",
          );

          const groups = await this.fileModel.groupBy({
            by: ["createdAt"],
            where: {
              createdAt: { gte: startDate, lte: endDate },
            },
            _count: { id: true },
          });

          // 그룹 결과를 "YYYY-MM" 형식의 맵으로 변환 (동일 월끼리 누적)
          const uploadMap: Record<string, number> = {};
          groups.forEach((group) => {
            const key = dayjs(group.createdAt).format("YYYY-MM");
            uploadMap[key] = (uploadMap[key] ?? 0) + group._count.id;
          });

          // 지난 6개월 (이번 달 포함) 동안 각 월의 데이터를 생성 (없으면 0)
          const uploads: { date: string; count: number }[] = [];
          for (let i = 5; i >= 0; i--) {
            const monthKey = dayjs().subtract(i, "month").format("YYYY-MM");
            uploads.push({ date: monthKey, count: uploadMap[monthKey] ?? 0 });
          }

          this.logger.info(
            { period, uploads },
            "파일 업로드 수 조회 성공 (6m)",
          );
          return { uploads };
        }

        default: {
          const _exhaustiveCheck: never = period;
          throw new Error(`Invalid period: ${String(_exhaustiveCheck)}`);
        }
      }
    } catch (error) {
      this.logger.error({ error, period }, "업로드 수 조회 실패");
      throw error;
    }
  }

  /**
   * 전체 파일 수를 반환합니다.
   *
   * 이 메서드는 휴지통에 있는 파일을 포함한 전체 파일 수를 데이터베이스에서 조회합니다.
   *
   * @returns `{ number }` - 전체 파일 수
   * @throws 전체 파일 수 조회 중 오류가 발생하면 해당 에러를 throw합니다.
   */
  public async getTotalFiles(): Promise<number> {
    try {
      this.logger.info(
        { methodName: "getTotalFiles" },
        "전체 파일 수 조회 시작",
      );

      const count = await this.fileModel.count();

      this.logger.info({ count }, "전체 파일 수 조회 성공");
      return count;
    } catch (error) {
      this.logger.error({ error }, "전체 파일 수 조회 실패");
      throw error;
    }
  }

  /**
   * 전체 유저 수를 반환합니다.
   *
   * 이 메서드는 데이터베이스 내의 전체 유저 수를 조회합니다.
   *
   * @returns `{ number }` - 전체 유저 수
   * @throws 전체 유저 수 조회 중 오류가 발생하면 해당 에러를 throw합니다.
   */
  public async getTotalUsers(): Promise<number> {
    try {
      this.logger.info(
        { methodName: "getTotalUsers" },
        "전체 유저 수 조회 시작",
      );

      const count = await this.userModel.count();

      this.logger.info({ count }, "전체 유저 수 조회 성공");
      return count;
    } catch (error) {
      this.logger.error({ error }, "전체 유저 수 조회 실패");
      throw error;
    }
  }

  /**
   * 특정 기간 동안 탈퇴한 유저 수를 반환합니다.
   *
   * 입력된 기간(`"1d"` 혹은 `"1w"`) 동안 탈퇴한 유저 수를 데이터베이스에서 집계하여 반환합니다.
   *
   * @param period - 탈퇴 유저 수를 조회할 기간 (`"1d"` 또는 `"1w"`)
   * @returns `{ number }` - 지정된 기간 동안 탈퇴한 유저 수
   * @throws 탈퇴한 유저 수 조회 중 오류가 발생하면 해당 에러를 throw합니다.
   */
  public async getDeletedUsersCount(period: "1d" | "1w"): Promise<number> {
    try {
      const startDate = this.getStartDate(period);
      this.logger.info(
        { methodName: "getDeletedUsersCount", period },
        "탈퇴 유저 수 조회 시작",
      );

      const count = await this.userModel.count({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
      });

      this.logger.info({ period, count }, "탈퇴 유저 수 조회 성공");
      return count;
    } catch (error) {
      this.logger.error({ error, period }, "탈퇴 유저 수 조회 실패");
      throw error;
    }
  }

  /**
   * 특정 사용자가 최근 업로드한 파일 목록을 반환합니다.
   *
   * @param currentUserId - 현재 로그인한 사용자의 ID
   * @param limit - 반환할 파일의 최대 개수 (기본값: 5)
   * @returns 해당 사용자가 최근에 업로드한 파일 목록 (최신순 내림차순)
   */
  public async getRecentUserFiles(
    currentUserId: string,
    limit = 5,
  ): Promise<FileMetadata[]> {
    try {
      const files = await this.fileModel.findMany({
        where: { ownerId: currentUserId },
        orderBy: { createdAt: "desc" },
        take: limit,
        include: { owner: true },
      });
      this.logger.info(
        { currentUserId, fileCount: files.length },
        "최근 업로드 파일 조회 성공",
      );
      return files;
    } catch (error) {
      this.logger.error({ error, currentUserId }, "최근 업로드 파일 조회 실패");
      throw error;
    }
  }
  /**
   * 관리자 로그인 처리 (username 또는 email 사용 가능)
   *
   * @param usernameOrEmail - 사용자 이름 또는 이메일
   * @param password - 비밀번호
   * @returns 관리자 권한이 있는 사용자 객체
   * @throws 사용자 없음, 비밀번호 불일치, 관리자 권한 없을 경우 예외 발생
   */
  public async login(usernameOrEmail: string, password: string): Promise<User> {
    this.logger.info(
      { methodName: "login", usernameOrEmail },
      "관리자 로그인 시도",
    );

    // username 또는 email로 사용자 조회
    const user = await this.userModel.findFirst({
      where: {
        OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      },
    });

    // 사용자 없으면 예외 처리
    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "관리자를 찾을 수 없습니다.",
      });
    }

    // 비밀번호 검증
    const isPasswordValid = await verify(user.hashedPassword, password);
    if (!isPasswordValid) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "비밀번호가 올바르지 않습니다.",
      });
    }

    // 관리자 권한 체크
    if (!user.isAdmin) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "관리자 권한이 없습니다.",
      });
    }

    this.logger.info({ usernameOrEmail }, "관리자 로그인 성공");
    return user;
  }

  /**
   * 관리자 로그인 후 세션 토큰 생성
   *
   * @param usernameOrEmail - 사용자 이름 또는 이메일
   * @param password - 비밀번호
   * @returns JWT 세션 토큰 (1시간 유효)
   * @throws Login 메서드에서 발생하는 예외 전파
   */
  public async loginAndCreateSession(
    usernameOrEmail: string,
    password: string,
  ): Promise<string> {
    // 로그인 시도 및 관리자 검증
    const user = await this.login(usernameOrEmail, password);

    // JWT 토큰 생성 (관리자 정보 포함)
    const token = jwt.sign(
      { id: user.id, email: user.email, isAdmin: user.isAdmin },
      env.AUTH_JWT_SECRET, // 환경변수로부터 비밀키 사용
      { expiresIn: "1h" }, // 토큰 유효기간 1시간
    );

    return token;
  }
  public async getUserWithPaymentHistory(params: {
    userId: string;
    paymentLimit: number;
    paymentCursor?: string;
  }) {
    const { userId, paymentLimit, paymentCursor } = params;

    // 1. 주어진 userId로 데이터베이스에서 유저 정보를 조회한다.
    //    - userModel.findUnique는 Prisma ORM을 사용해 단일 유저를 검색하는 메서드다.
    //    - 필요한 필드만 선택해서 조회할 수 있으므로, 민감한 정보는 제외 가능하다.
    //    - 유저가 존재하지 않으면 null을 반환한다.
    const user = await this.userModel.findUnique({
      where: { id: userId },
      // 필요 시 select 옵션으로 반환 필드 제한 가능
    });

    // 2. 조회된 유저가 없으면, TRPCError를 던져서 'NOT_FOUND' 에러를 발생시킨다.
    //    - 클라이언트에서는 이 에러를 받아 사용자 미존재를 인지할 수 있다.
    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "사용자를 찾을 수 없습니다.",
      });
    }

    // 3. paymentService의 getPaymentHistory 메서드를 호출해 해당 유저의 결제 내역을 페이징 조회한다.
    const paymentHistory = await this.paymentService.getPaymentHistory({
      userId,
      limit: paymentLimit,
      cursor: paymentCursor,
    });

    // 4. 조회한 유저 정보와 결제 내역을 하나의 객체로 묶어 반환한다.
    //    - 프론트엔드 또는 호출한 API에서 유저 정보와 결제 내역을 같이 활용할 수 있도록 한다.
    return {
      user,
      paymentHistory,
    };
  }
}
