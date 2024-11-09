import { injectable, inject } from "inversify";
import type { Prisma, Folder } from "@cirrodrive/database";
import type { Logger } from "pino";
import { Symbols } from "@/types/symbols.ts";

/**
 * 폴더 서비스입니다.
 */
@injectable()
export class FolderService {
  constructor(
    @inject(Symbols.Logger) private logger: Logger,
    @inject(Symbols.FolderModel) private folderModel: Prisma.FolderDelegate,
  ) {
    this.logger = logger.child({ serviceName: "FolderService" });
  }

  /**
   * 새로운 폴더를 생성합니다.
   *
   * @param userId - 폴더를 생성할 회원의 ID입니다.
   * @param name - 생성할 폴더의 이름입니다.
   * @param parentId - 부모 폴더의 ID입니다 (최상위 폴더일 경우 null).
   * @returns 생성된 폴더 정보입니다.
   * @throws 폴더 생성 중 오류가 발생한 경우.
   */
  public async createFolder(
    userId: number,
    name: string,
    parentId: number | null,
  ): Promise<Folder> {
    try {
      this.logger.info(
        {
          methodName: "createFolder",
          userId,
          name,
          parentId,
        },
        "폴더 생성 시작",
      );

      const folder = await this.folderModel.create({
        data: {
          userId,
          name,
          parentId,
        },
      });

      return folder;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error.message);
      }
      throw error;
    }
  }

  /**
   * 사용자의 폴더 목록을 조회합니다.
   *
   * @param userId - 폴더를 조회할 회원의 ID입니다.
   * @param parentId - 특정 부모 폴더 아래의 폴더 목록을 조회할 경우 부모 폴더의 ID입니다.
   * @returns 폴더 목록입니다.
   * @throws 폴더 조회 중 오류가 발생한 경우.
   */
  public async getFoldersByUserId(
    userId: number,
    parentId: number | null,
  ): Promise<Folder[]> {
    try {
      this.logger.info(
        {
          methodName: "getFoldersByUserId",
          userId,
          parentId,
        },
        "폴더 목록 조회 시작",
      );

      const folders = await this.folderModel.findMany({
        where: {
          userId,
          parentId,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      return folders;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error.message);
      }
      throw error;
    }
  }

  /**
   * 특정 폴더를 조회합니다.
   *
   * @param userId - 회원의 ID입니다.
   * @param folderId - 조회할 폴더의 ID입니다.
   * @returns 폴더 정보입니다.
   * @throws 폴더 조회 중 오류가 발생한 경우.
   */
  public async getFolderById(
    userId: number,
    folderId: number,
  ): Promise<Folder | null> {
    try {
      this.logger.info(
        {
          methodName: "getFolderById",
          userId,
          folderId,
        },
        "폴더 조회 시작",
      );

      const folder = await this.folderModel.findFirst({
        where: {
          id: folderId,
          userId,
        },
      });

      if (!folder) {
        throw new Error("해당 폴더를 찾을 수 없습니다.");
      }

      return folder;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error.message);
      }
      throw error;
    }
  }

  /**
   * 폴더를 삭제합니다.
   *
   * @param userId - 회원의 ID입니다.
   * @param folderId - 삭제할 폴더의 ID입니다.
   * @throws 폴더 삭제 중 오류가 발생한 경우.
   */
  public async deleteFolder(userId: number, folderId: number): Promise<void> {
    try {
      this.logger.info(
        {
          methodName: "deleteFolder",
          userId,
          folderId,
        },
        "폴더 삭제 시작",
      );

      await this.folderModel.deleteMany({
        where: {
          id: folderId,
          userId,
        },
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Record to delete does not exist.")
      ) {
        throw new Error("해당 폴더를 찾을 수 없습니다.");
      }
      if (error instanceof Error) {
        this.logger.error(error.message);
      }
      throw error;
    }
  }
}
