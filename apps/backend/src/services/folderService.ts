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
   * @param ownerId - 폴더를 생성할 회원의 ID입니다.
   * @param name - 생성할 폴더의 이름입니다.
   * @param parentFolderId - 부모 폴더의 ID입니다 (최상위 폴더일 경우 null).
   * @returns 생성된 폴더 정보입니다.
   * @throws 폴더 생성 중 오류가 발생한 경우.
   */
  public async create(
    ownerId: number,
    name: string,
    parentFolderId?: number,
  ): Promise<Folder> {
    try {
      this.logger.info(
        {
          methodName: "createFolder",
          ownerId,
          name,
          parentId: parentFolderId,
        },
        "폴더 생성 시작",
      );

      const folder = await this.folderModel.create({
        data: {
          ownerId,
          name,
          parentFolderId,
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
   * @param ownerId - 폴더를 조회할 회원의 ID입니다.
   * @param parentFolderId - 특정 부모 폴더 아래의 폴더 목록을 조회할 경우 부모 폴더의 ID입니다.
   * @returns 폴더 목록입니다.
   * @throws 폴더 조회 중 오류가 발생한 경우.
   */
  public async listByUser(
    ownerId: number,
    parentFolderId?: number,
  ): Promise<Folder[]> {
    try {
      this.logger.info(
        {
          methodName: "getFoldersByUserId",
          ownerId,
          parentFolderId,
        },
        "폴더 목록 조회 시작",
      );

      const folders = await this.folderModel.findMany({
        where: {
          ownerId,
          parentFolderId,
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
   * @param ownerId - 회원의 ID입니다.
   * @param folderId - 조회할 폴더의 ID입니다.
   * @returns 폴더 정보입니다.
   * @throws 폴더 조회 중 오류가 발생한 경우.
   */
  public async get(ownerId: number, folderId: number): Promise<Folder | null> {
    try {
      this.logger.info(
        {
          methodName: "getFolderById",
          ownerId,
          folderId,
        },
        "폴더 조회 시작",
      );

      const folder = await this.folderModel.findFirst({
        where: {
          id: folderId,
          ownerId,
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
   * @param ownerId - 회원의 ID입니다.
   * @param folderId - 삭제할 폴더의 ID입니다.
   * @throws 폴더 삭제 중 오류가 발생한 경우.
   */
  public async delete(ownerId: number, folderId: number): Promise<void> {
    try {
      this.logger.info(
        {
          methodName: "deleteFolder",
          ownerId,
          folderId,
        },
        "폴더 삭제 시작",
      );

      await this.folderModel.deleteMany({
        where: {
          id: folderId,
          ownerId,
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
