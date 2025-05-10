import { injectable, inject } from "inversify";
import type { Prisma, Folder } from "@cirrodrive/database";
import type { Logger } from "pino";
import type { EntryDTO, RecursiveEntryDTO } from "@cirrodrive/schemas";
import { Symbols } from "@/types/symbols.ts";
import { FileService } from "@/services/file.service.ts";
import { UserService } from "@/services/user.service.ts";
/**
 * 폴더 서비스입니다.
 */
@injectable()
export class FolderService {
  constructor(
    @inject(Symbols.Logger) private logger: Logger,
    @inject(UserService) private userService: UserService,
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
   * @throws 폴더 생성 중 오류��� 발생한 경우.
   */
  public async create({
    ownerId,
    name,
    parentFolderId,
  }: {
    ownerId: number;
    name: string;
    parentFolderId: number;
  }): Promise<Folder> {
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

      const newName = await this.generateFolderName({ name, parentFolderId });

      const folder = await this.folderModel.create({
        data: {
          ownerId,
          name: newName,
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
  public async listByUser({
    ownerId,
    parentFolderId,
  }: {
    ownerId: number;
    parentFolderId?: number;
  }): Promise<Folder[]> {
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
  public async listByParentFolder({
    parentFolderId,
  }: {
    parentFolderId: number;
  }): Promise<
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
  public async get({
    folderId,
  }: {
    folderId: number;
  }): Promise<Prisma.FolderGetPayload<{
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
   * 폴더를 재귀적으로 조회합니다.
   *
   * @param folderId - 조회할 폴더의 ID입니다.
   * @returns 폴더 정보입니다.
   * @throws 폴더 조회 중 오류가 발생한 경우.
   */
  public async getRecursively({
    folderId,
    include = "folder",
    trashed = false,
  }: {
    folderId: number;
    include?: "entry" | "folder";
    trashed?: boolean;
  }): Promise<RecursiveEntryDTO> {
    const folder = await this.get({ folderId });

    if (!folder) {
      throw new Error("폴더를 찾을 수 없습니다.");
    }

    let isTrashed = trashed;

    if (!isTrashed) {
      // 이 폴더의 최상위 폴더를 찾습니다.
      const rootFolderId = (await this.getPath({ folderId }))[0]?.folderId;
      if (rootFolderId) {
        const root = await this.folderModel.findUnique({
          where: {
            id: rootFolderId,
          },
        });

        if (!root) {
          throw new Error("최상위 폴더를 찾을 수 없습니다.");
        }

        isTrashed = root.name === "trash";
      }
    }

    const recursiveEntry: RecursiveEntryDTO = {
      id: folder.id,
      name: folder.name,
      type: "folder",
      parentFolderId: folder.parentFolderId,
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt,
      trashedAt: isTrashed ? folder.updatedAt : null,
      size: null,
      entries: [],
    };

    for (const subFolder of folder.subFolders) {
      const subFolderEntry = await this.getRecursively({
        folderId: subFolder.id,
        trashed: isTrashed,
        include,
      });
      recursiveEntry.entries?.push(subFolderEntry);
    }

    if (include === "entry") {
      const fileEntries: EntryDTO[] = folder.files.map((file) => ({
        id: file.id,
        name: file.name,
        type: "file",
        parentFolderId: file.parentFolderId,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
        trashedAt: isTrashed ? file.updatedAt : null,
        size: file.size,
      }));

      recursiveEntry.entries?.push(...fileEntries);
    }

    return recursiveEntry;
  }

  public async getAllSubEntries({
    folderId,
  }: {
    folderId: number;
  }): Promise<EntryDTO[]> {
    const folder = await this.get({ folderId });

    if (!folder) {
      throw new Error("폴더를 찾을 수 없습니다.");
    }

    const entries: EntryDTO[] = [];

    for (const subFolder of folder.subFolders) {
      const subFolderEntry = await this.getAllSubEntries({
        folderId: subFolder.id,
      });
      entries.push(...subFolderEntry);
    }

    const fileEntries: EntryDTO[] = folder.files.map((file) => ({
      id: file.id,
      name: file.name,
      type: "file",
      parentFolderId: file.parentFolderId,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      trashedAt: file.trashedAt,
      size: file.size,
    }));

    entries.push(...fileEntries);

    return entries;
  }

  public async getPath({ folderId }: { folderId: number }): Promise<
    {
      folderId: number | null;
      name: string;
    }[]
  > {
    try {
      this.logger.info(
        {
          methodName: "getFolderPath",
          folderId,
        },
        "폴더 경로 조회 시작",
      );

      const path: {
        folderId: number;
        name: string;
      }[] = [];

      let folder = await this.folderModel.findUnique({
        where: {
          id: folderId,
        },
      });

      if (!folder) {
        throw new Error("폴더를 찾을 수 없습니다.");
      }

      while (folder?.parentFolderId) {
        path.unshift({
          folderId: folder.id,
          name: folder.name,
        });

        folder = await this.folderModel.findUnique({
          where: {
            id: folder.parentFolderId,
          },
        });
      }

      path.unshift({
        folderId: folder!.id,
        name: folder!.name,
      });

      return path;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error.message);
      }
      throw error;
    }
  }

  /**
   * 사용자의 휴지통 폴더 목록을 조회합니다.
   *
   * @param ownerId - 휴지통 폴더를 조회할 회원의 ID입니다.
   * @returns 휴지통 폴더 목록입니다.
   * @throws 휴지통 폴더 조회 중 오류가 발생한 경우.
   */
  public async listTrashByUser({
    ownerId,
  }: {
    ownerId: number;
  }): Promise<Folder[]> {
    try {
      this.logger.info(
        {
          methodName: "listTrashByUser",
          ownerId,
        },
        "휴지통 폴더 목록 조회 시작",
      );

      const folders = await this.folderModel.findMany({
        where: {
          ownerId,
          trashedAt: {
            not: null,
          },
        },
        orderBy: {
          trashedAt: "asc",
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
  public async moveToTrash({
    folderId,
    userId,
  }: {
    folderId: number;
    userId: number;
  }): Promise<void> {
    this.logger.info(
      { folderId, userId },
      "폴더와 파일을 휴지통으로 이동 시작",
    );

    const user = await this.userService.get({ id: userId });

    if (!user) {
      throw new Error("사용자를 찾을 수 없습니다.");
    }

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
      data: {
        restoreFolderId: folder.parentFolderId,
        parentFolderId: user.trashFolderId,
        trashedAt: new Date(),
      },
    });

    this.logger.info({ folderId }, "폴더와 파일을 휴지통으로 이동 완료");
  }

  /**
   * 폴더를 휴지통에서 복원합니다.
   *
   * @param folderId - 복원할 폴더의 ID
   * @param userId - 사용자 ID
   */
  public async restoreFromTrash({
    folderId,
    userId,
  }: {
    folderId: number;
    userId: number;
  }): Promise<void> {
    this.logger.info({ folderId, userId }, "폴더 복원 시작");

    // 폴더 소유권 확인
    const folder = await this.folderModel.findUnique({
      where: { id: folderId },
    });

    if (!folder || folder.ownerId !== userId) {
      throw new Error("폴더에 접근 권한이 없습니다.");
    }

    // 폴더가 이미 복원된 상태라면 예외 처리
    if (!folder.trashedAt) {
      throw new Error("폴더는 이미 복원된 상태입니다.");
    }

    // 폴더 복원
    await this.folderModel.update({
      where: { id: folderId },
      data: {
        trashedAt: null,
        parentFolderId: folder.restoreFolderId,
        restoreFolderId: null,
      }, // trashedAt을 null로 설정하여 복원
    });

    this.logger.info({ folderId }, "폴더와 파일 복원 완료");
  }

  /**
   * 폴더를 영구 삭제합니다.
   *
   * @param folderId - 삭제할 폴더의 ID
   * @param userId - 사용자 ID
   */
  public async deleteFolder({
    folderId,
    userId,
  }: {
    folderId: number;
    userId: number;
  }): Promise<void> {
    this.logger.info({ folderId, userId }, "폴더 삭제 시작");

    // 폴더 소유권 확인
    const folder = await this.folderModel.findUnique({
      where: { id: folderId },
      include: {
        // 폴더 내의 파일과 폴더를 모두 조회
        files: true,
        subFolders: true,
      },
    });

    if (!folder || folder.ownerId !== userId) {
      throw new Error("폴더에 접근 권한이 없습니다.");
    }

    // 하위 폴더 삭제
    for (const subFolder of folder.subFolders) {
      await this.deleteFolder({ folderId: subFolder.id, userId });
    }

    // 파일 삭제
    for (const file of folder.files) {
      await this.fileService.deleteFile({ fileId: file.id });
    }

    // 폴더 삭제
    await this.folderModel.delete({
      where: { id: folderId },
    });

    this.logger.info({ folderId }, "폴더 및 포함된 파일 삭제 완료");
  }

  /**
   * 폴더를 다른 폴더로 이동합니다.
   *
   * @param ownerId - 폴더를 이동할 회원의 ID입니다.
   * @param sourceFolderId - 이동할 폴더의 ID입니다.
   * @param targetFolderId - 이동할 대상 폴더의 ID입니다.
   * @throws 폴더 이동 중 오류가 발생한 경우.
   */
  public async moveFolder({
    ownerId,
    sourceFolderId,
    targetFolderId,
  }: {
    ownerId: number;
    sourceFolderId: number;
    targetFolderId: number;
  }): Promise<void> {
    try {
      this.logger.info(
        { methodName: "moveFolder", ownerId, sourceFolderId, targetFolderId },
        "폴더 이동 시작",
      );

      // 이동할 폴더 조회
      const sourceFolder = await this.folderModel.findUnique({
        where: { id: sourceFolderId },
        include: {
          subFolders: true,
          files: true,
        },
      });

      if (!sourceFolder) {
        throw new Error("이동할 폴더를 찾을 수 없습니다.");
      }

      // 대상 폴더 조회
      const targetFolder = await this.folderModel.findUnique({
        where: { id: targetFolderId },
      });

      if (!targetFolder) {
        throw new Error("대상 폴더를 찾을 수 없습니다.");
      }

      // 이동하려는 폴더가 대상 폴더의 하위 폴더가 아닌지 확인
      if (
        sourceFolderId === targetFolderId ||
        sourceFolder.parentFolderId === targetFolderId
      ) {
        throw new Error(
          "폴더는 자신이나 자신의 하위 폴더로 이동할 수 없습니다.",
        );
      }

      let newName = sourceFolder.name;
      if (
        await this.existsFolderName({
          targetName: sourceFolder.name,
          parentFolderId: targetFolderId,
        })
      ) {
        newName = await this.generateFolderName({
          name: sourceFolder.name,
          parentFolderId: targetFolderId,
        });
      }

      // 폴더 이동
      await this.folderModel.update({
        where: { id: sourceFolderId },
        data: {
          parentFolderId: targetFolderId,
          name: newName,
        },
      });

      this.logger.info(
        { sourceFolderId, targetFolderId, ownerId },
        "폴더와 파일들이 성공적으로 이동되었습니다.",
      );
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error.message);
      }
      throw error;
    }
  }

  /**
   * 폴더 이름을 변경합니다.
   *
   * @param folderId - 이름을 변경할 폴더의 ID입니다.
   * @param name - 변경할 폴더의 이름입니다.
   * @throws 폴더 이름 변경 중 오류가 발생한 경우.
   */
  public async rename({
    folderId,
    targetName,
  }: {
    folderId: number;
    targetName: string;
  }): Promise<void> {
    try {
      this.logger.info({ folderId, targetName }, "폴더 이름 변경 시작");

      const folder = await this.folderModel.findUnique({
        where: { id: folderId },
      });

      if (!folder) {
        throw new Error("폴더를 찾을 수 없습니다.");
      }

      if (folder.parentFolderId === null) {
        throw new Error("최상위 폴더의 이름은 변경할 수 없습니다.");
      }

      if (folder.trashedAt) {
        throw new Error("휴지통에 있는 폴더의 이름은 변경할 수 없습니다.");
      }

      if (targetName === "") {
        throw new Error("폴더 이름은 비워둘 수 없습니다.");
      }

      const newName = await this.generateFolderName({
        name: targetName,
        parentFolderId: folder.parentFolderId,
      });

      if (
        await this.existsFolderName({
          targetName: newName,
          parentFolderId: folder.parentFolderId,
        })
      ) {
        throw new Error("이미 사용중인 폴더 이름입니다.");
      }

      await this.folderModel.update({
        where: { id: folderId },
        data: {
          name: newName,
        },
      });

      this.logger.info({ folderId, name: targetName }, "폴더 이름 변경 완료");
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error.message);
      }
      throw error;
    }
  }

  /**
   * 동일한 폴더 이름이 존재하는지 확인합니다.
   *
   * @param ownerId - 폴더를 생성할 회원의 ID입니다.
   * @param name - 생성할 폴더의 이름입니다.
   * @param parentFolderId - 부모 폴더의 ID입니다 (최상위 폴더일 경우 null).
   * @returns 동일한 이름의 폴더가 존재하는지 여부입니다.
   */
  public async existsFolderName({
    targetName,
    parentFolderId,
  }: {
    targetName: string;
    parentFolderId?: number;
  }): Promise<boolean> {
    try {
      this.logger.info(
        {
          methodName: "existsFolderName",
          targetName,
          parentFolderId,
        },
        "폴더 이름 중복 확인 시작",
      );

      const folder = await this.folderModel.findFirst({
        where: {
          name: targetName,
          parentFolderId,
        },
      });

      const result = Boolean(folder);

      this.logger.info(
        {
          methodName: "existsFolderName",
          targetName,
          parentFolderId,
          result,
        },
        "폴더 이름 중복 확인 결과",
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
   * 적절한 폴더 이름을 생성합니다. 동일한 이름의 폴더가 존재할 경우 이름을 변경합니다.
   *
   * @param ownerId - 폴더를 생성할 회원의 ID입니다.
   * @param name - 생성할 폴더의 이름입니다.
   * @param parentFolderId - 부모 폴더의 ID입니다 (최상위 폴더일 경우 null).
   * @returns 생성된 폴더의 이름입니다.
   */
  public async generateFolderName({
    name: targetName,
    parentFolderId,
  }: {
    name: string;
    parentFolderId: number;
  }): Promise<string> {
    try {
      this.logger.info(
        {
          methodName: "generateFolderName",
          targetName,
          parentFolderId,
        },
        "폴더 이름 생성 시작",
      );

      if (!(await this.existsFolderName({ targetName, parentFolderId }))) {
        this.logger.info(
          {
            methodName: "generateFolderName",
            targetName,
            parentFolderId,
          },
          "폴더 이름 생성 완료",
        );

        return targetName;
      }

      const regexpResult = /^(?<originalName>.*?)(?: \((?<count>\d+)\))?$/.exec(
        targetName,
      );

      if (!regexpResult) {
        throw new Error("폴더 이름을 분석할 수 없습니다.");
      }

      let originalName = regexpResult.groups?.originalName ?? targetName;
      let count = 1;

      if (regexpResult.groups?.count) {
        originalName = targetName;
        count = parseInt(regexpResult.groups.count);
      }

      let folderName = `${originalName} (${count})`;

      // 동일한 이름의 폴더가 존재할 경우 이름 변경
      while (
        await this.existsFolderName({ targetName: folderName, parentFolderId })
      ) {
        folderName = `${originalName} (${count})`;
        count += 1;
      }

      this.logger.info(
        {
          methodName: "generateFolderName",
          targetName,
          parentFolderId,
          folderName,
        },
        "폴더 이름 생성 완료",
      );

      return folderName;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error.message);
      }
      throw error;
    }
  }
}
