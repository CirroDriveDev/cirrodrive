import { injectable, inject } from "inversify";
import type { Prisma, Folder } from "@cirrodrive/database";
import type { Logger } from "pino";
import { Symbols } from "@/types/symbols.ts";
import { prisma } from "@/loaders/prisma.ts";
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
   * 폴더의 하위 폴더 목록을 조회합니다.
   *
   * @param parentFolderId - 폴더의 ID입니다.
   * @returns 폴더의 하위 폴더 목록입니다.
   */
  public async listByParentFolder(parentFolderId: number): Promise<
    Prisma.FolderGetPayload<{
      include: {
        subFolders: true;
        files: true;
      };
    }>[]
  > {
    try {
      this.logger.info(
        {
          methodName: "getFoldersByFolderId",
          parentFolderId,
        },
        "폴더의 하위 폴더 목록 조회 시작",
      );

      const folders = await this.folderModel.findMany({
        where: {
          parentFolderId,
        },
        include: {
          subFolders: true,
          files: true,
        },
        orderBy: {
          name: "asc",
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
   * @param folderId - 조회할 폴더의 ID입니다.
   * @returns 폴더 정보입니다.
   * @throws 폴더 조회 중 오류가 발생한 경우.
   */
  public async get(folderId: number): Promise<Prisma.FolderGetPayload<{
    include: {
      subFolders: true;
      files: true;
    };
  }> | null> {
    try {
      this.logger.info(
        {
          methodName: "getFolderById",
          folderId,
        },
        "폴더 조회 시작",
      );

      const folder = await this.folderModel.findFirst({
        where: {
          id: folderId,
        },
        include: {
          subFolders: true,
          files: true,
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
   * 폴더의 소유자인지 확인합니다.
   *
   * @param userId - 회원의 ID입니다.
   * @param folderId - 폴더의 ID입니다.
   * @returns 소유자 여부입니다.
   */
  public async isOwner({
    userId,
    folderId,
  }: {
    userId: number;
    folderId: number;
  }): Promise<boolean> {
    try {
      this.logger.info(
        {
          methodName: "isOwner",
          folderId,
          userId,
        },
        "폴더 소유자 확인 시작",
      );

      const folder = await this.folderModel.findUnique({
        where: {
          id: folderId,
        },
      });
      const result = folder?.ownerId === userId;

      this.logger.info(
        {
          methodName: "isOwner",
          folderId,
          ownerId: folder?.ownerId,
          userId,
          result,
        },
        "폴더 소유자 확인 결과",
      );

      return result;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error.message);
      }
      throw error;
    }
  }
  /**
   * 폴더를 휴지통으로 이동합니다.
   *
   * @param ownerId - 회원의 ID입니다.
   * @param folderId - 휴지통으로 이동할 폴더의 ID입니다.
   * @throws 휴지통 이동 중 오류가 발생한 경우.
   */
  async moveFolderToTrash(folderId: number, userId: number): Promise<void> {
    const currentDate = new Date();

    await prisma.$transaction(async (tx) => {
      // 폴더 소유자 검증
      const folder = await tx.folder.findUnique({
        where: { id: folderId },
      });

      if (!folder || folder.ownerId !== userId) {
        throw new Error("해당 폴더에 접근 권한이 없습니다.");
      }

      // 폴더 내 파일을 휴지통으로 이동
      await tx.fileMetadata.updateMany({
        where: { parentFolderId: folderId },
        data: { trashedAt: currentDate },
      });

      // 하위 폴더를 재귀적으로 휴지통으로 이동
      const moveToTrashRecursive = async (id: number): Promise<void> => {
        await tx.folder.update({
          where: { id },
          data: { trashedAt: currentDate },
        });

        const subFolders = await tx.folder.findMany({
          where: { parentFolderId: id },
        });

        for (const subFolder of subFolders) {
          await moveToTrashRecursive(subFolder.id);
        }
      };

      await moveToTrashRecursive(folderId);
    });
  }
  /**
   * 휴지통에서 폴더 복원
   */
  async restoreFolderFromTrash(
    folderId: number,
    userId: number,
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const folder = await tx.folder.findUnique({
        where: { id: folderId },
      });

      if (!folder || folder.ownerId !== userId) {
        throw new Error("해당 폴더에 접근 권한이 없습니다.");
      }

      // 폴더 및 하위 파일/폴더 복원
      const restoreRecursive = async (id: number): Promise<void> => {
        // 폴더 복원
        await tx.folder.update({
          where: { id },
          data: { trashedAt: null },
        });

        // 해당 폴더 내 파일 복원
        await tx.fileMetadata.updateMany({
          where: { parentFolderId: id },
          data: { trashedAt: null },
        });

        // 하위 폴더들 찾아서 재귀적으로 복원
        const subFolders = await tx.folder.findMany({
          where: { parentFolderId: id },
        });

        for (const subFolder of subFolders) {
          await restoreRecursive(subFolder.id);
        }
      };

      // 폴더 및 하위 폴더 복원
      await restoreRecursive(folderId);
    });
  }
  /**
   * 휴지통에 있는 폴더 삭제
   */
  async deleteFolder(folderId: number, userId: number): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const folder = await tx.folder.findUnique({
        where: { id: folderId },
      });

      if (!folder || folder.ownerId !== userId) {
        throw new Error("해당 폴더에 접근 권한이 없습니다.");
      }

      const deleteRecursive = async (id: number): Promise<void> => {
        // 해당 폴더 내 파일 삭제
        await tx.fileMetadata.deleteMany({
          where: { parentFolderId: id },
        });

        // 하위 폴더들 찾아서 재귀적으로 삭제
        const subFolders = await tx.folder.findMany({
          where: { parentFolderId: id },
        });

        for (const subFolder of subFolders) {
          await deleteRecursive(subFolder.id);
        }

        // 폴더 삭제
        await tx.folder.delete({
          where: { id },
        });
      };

      // 폴더 및 하위 폴더 삭제
      await deleteRecursive(folderId);
    });
  }
}
