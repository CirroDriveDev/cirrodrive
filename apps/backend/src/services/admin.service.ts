import { injectable, inject } from "inversify";
import type { Prisma, User, FileMetadata } from "@cirrodrive/database";
import { hash, verify } from "@node-rs/argon2";
import type { Logger } from "pino";
import { TRPCError } from "@trpc/server";
import { sign } from "jsonwebtoken";
import { dayjs } from "@/loaders/dayjs.loader.ts";
import { Symbols } from "@/types/symbols.ts";
import { env } from "@/loaders/env.loader.ts";

@injectable()
export class AdminService {
  constructor(
    @inject(Symbols.Logger) private logger: Logger,
    @inject(Symbols.UserModel) private userModel: Prisma.UserDelegate,
    @inject(Symbols.FolderModel) private folderModel: Prisma.FolderDelegate,
    @inject(Symbols.FileMetadataModel)
    private fileModel: Prisma.FileMetadataDelegate,
  ) {
    this.logger = logger.child({ serviceName: "AdminService" });
  }

  /**
   * 새로운 관리자를 생성합니다.
   *
   * @param username - 관리자 이름
   * @param password - 비밀번호
   * @param email - 이메일
   * @param pricingPlan - 관리자 요금제
   * @param profileImageUrl - 프로필 이미지 URL
   * @param usedStorage - 사용된 저장 공간
   * @returns 생성된 관리자
   * @throws 관리자 생성 중 오류가 발생한 경우
   */
  public async create({
    username,
    password,
    email,
    pricingPlan,
    profileImageUrl,
    usedStorage,
    isAdmin,
  }: {
    username: string;
    password: string;
    email: string;
    pricingPlan: "free" | "basic" | "premium";
    profileImageUrl: string | null;
    usedStorage: number;
    isAdmin: boolean;
  }): Promise<User> {
    try {
      this.logger.info(
        {
          methodName: "create",
          username,
          email,
        },
        "관리자 계정 생성 시작",
      );

      const hashedPassword = await hash(password);

      const admin = await this.userModel.create({
        data: {
          username,
          email,
          hashedPassword,
          pricingPlan,
          profileImageUrl,
          usedStorage,
          isAdmin, // 관리자 여부 설정
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
        },
      });

      await this.folderModel.update({
        where: {
          id: admin.rootFolderId,
        },
        data: {
          owner: {
            connect: {
              id: admin.id,
            },
          },
        },
      });

      await this.folderModel.update({
        where: {
          id: admin.trashFolderId,
        },
        data: {
          owner: {
            connect: {
              id: admin.id,
            },
          },
        },
      });

      return admin;
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

      // 유저 관련 데이터 삭제 (예: 폴더 삭제)
      if (user.rootFolderId) {
        await this.folderModel.delete({ where: { id: user.rootFolderId } });
      }
      if (user.trashFolderId) {
        await this.folderModel.delete({ where: { id: user.trashFolderId } });
      }

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
      pricingPlan?: "free" | "basic" | "premium";
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
        pricingPlan: data.pricingPlan ?? existingUser.pricingPlan,
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
    currentUserId, // 현재 로그인된 사용자 ID
  }: {
    limit: number;
    offset: number;
    sortBy?: "uploadDate" | "owner";
    order?: "asc" | "desc";
    currentUserId: string; // 현재 로그인된 사용자의 ID
  }): Promise<FileMetadata[]> {
    try {
      // 관리자 인증: 현재 사용자가 관리자 권한을 가지고 있는지 확인
      const user = await this.userModel.findUnique({
        where: { id: currentUserId },
      });

      // 관리자가 아니면 오류를 반환
      if (!user?.isAdmin) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "관리자만 접근할 수 있습니다.",
        });
      }

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
   * 이메일로 관리자 로그인 처리
   *
   * @param email - 관리자 이메일
   * @param password - 비밀번호
   * @returns 관리자 유저 객체
   */
  public async login(email: string, password: string): Promise<User> {
    try {
      this.logger.info({ methodName: "login", email }, "관리자 로그인 시도");

      const user = await this.userModel.findUnique({
        where: { email },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "관리자를 찾을 수 없습니다.",
        });
      }

      const isPasswordValid = await verify(user.hashedPassword, password);
      if (!isPasswordValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "비밀번호가 올바르지 않습니다.",
        });
      }

      if (!user.isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "관리자 권한이 없습니다.",
        });
      }

      this.logger.info({ email }, "관리자 로그인 성공");
      return user;
    } catch (error) {
      this.logger.error({ error, email }, "관리자 로그인 실패");
      throw error;
    }
  }
  /**
   * 관리자 세션 생성
   *
   * @param email - 관리자 이메일
   * @param password - 관리자 비밀번호
   * @returns 세션 토큰
   */
  public async loginAndCreateSession(
    email: string,
    password: string,
  ): Promise<string> {
    try {
      this.logger.info(
        { methodName: "loginAndCreateSession", email },
        "관리자 로그인 시도",
      );

      const user = await this.userModel.findUnique({
        where: { email },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "관리자를 찾을 수 없습니다.",
        });
      }

      const isPasswordValid = await verify(user.hashedPassword, password);
      if (!isPasswordValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "비밀번호가 올바르지 않습니다.",
        });
      }

      if (!user.isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "관리자 권한이 없습니다.",
        });
      }

      const token = sign(
        { id: user.id, email: user.email, isAdmin: user.isAdmin },
        env.JWT_SECRET, // non-null 단정 사용
        { expiresIn: "1h" },
      );

      this.logger.info({ email }, "관리자 로그인 성공");
      return token;
    } catch (error) {
      this.logger.error({ error, email }, "관리자 로그인 실패");
      throw error;
    }
  }
}
