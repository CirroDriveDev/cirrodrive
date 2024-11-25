import { injectable, inject } from "inversify";
import type { Prisma, Folder } from "@cirrodrive/database";
import type { Logger } from "pino";
import { Symbols } from "@/types/symbols.ts";
import { FileService } from "@/services/fileService.ts";
/**
 * 폴더 서비스입니다.
 */
@injectable()
export class FolderService {
  constructor(
    @inject(Symbols.Logger) private logger: Logger,
    @inject(Symbols.FolderModel) private folderModel: Prisma.FolderDelegate,
    @inject(FileService) private fileService: FileService,
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
   * @param folderId - 휴지통으로 이동할 폴더의 ID
   * @param userId - 사용자 ID
   */
  public async moveToTrash(folderId: number, userId: number): Promise<void> {
    this.logger.info({ folderId, userId }, "폴더 휴지통 이동 시작");

    // 폴더 소유권 확인
    const folder = await this.folderModel.findUnique({
      where: { id: folderId },
    });
    if (!folder || folder.ownerId !== userId) {
      throw new Error("폴더에 접근 권한이 없습니다.");
    }

    // 폴더를 휴지통으로 이동
    await this.folderModel.update({
      where: { id: folderId },
      data: { trashedAt: new Date() },
    });

    // 파일을 휴지통으로 이동
    await this.fileService.moveToTrash(folderId);

    this.logger.info({ folderId }, "폴더 휴지통 이동 완료");
  }
  /**
   * 폴더를 복원합니다.
   *
   * @param folderId - 복원할 폴더의 ID
   * @param userId - 사용자 ID
   */
  public async restoreFromTrash(
    folderId: number,
    userId: number,
  ): Promise<void> {
    this.logger.info({ folderId, userId }, "폴더 복원 시작");

    // 폴더 소유권 확인
    const folder = await this.folderModel.findUnique({
      where: { id: folderId },
    });
    if (!folder || folder.ownerId !== userId) {
      throw new Error("폴더에 접근 권한이 없습니다.");
    }

    // 폴더 복원
    await this.folderModel.update({
      where: { id: folderId },
      data: { trashedAt: null },
    });

    // 파일 복원
    await this.fileService.restoreFromTrash(folderId);

    this.logger.info({ folderId }, "폴더 복원 완료");
  }
  /**
   * 폴더를 영구 삭제합니다.
   *
   * @param folderId - 삭제할 폴더의 ID
   * @param userId - 사용자 ID
   */
  public async deleteFolder(folderId: number, userId: number): Promise<void> {
    this.logger.info({ folderId, userId }, "폴더 삭제 시작");

    // 폴더 소유권 확인
    const folder = await this.folderModel.findUnique({
      where: { id: folderId },
    });
    if (!folder || folder.ownerId !== userId) {
      throw new Error("폴더에 접근 권한이 없습니다.");
    }

    // 파일 영구 삭제
    await this.fileService.deleteFile(folderId);

    // 폴더 삭제
    await this.folderModel.delete({
      where: { id: folderId },
    });

    this.logger.info({ folderId }, "폴더 삭제 완료");
  }
}
