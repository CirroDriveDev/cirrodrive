import { injectable } from "inversify";
import { File, Prisma, type $Enums } from "@cirrodrive/database";
import { BaseRepository } from "@/repositories/base.repository.ts";

@injectable()
export class FileRepository extends BaseRepository {
  // 생성
  public async create(data: Prisma.FileUncheckedCreateInput): Promise<File> {
    return this.prisma.file.create({ data });
  }

  // 조회
  public async get(id: string): Promise<File> {
    const file = await this.prisma.file.findUnique({
      where: {
        id,
      },
    });

    if (!file) {
      throw new Error("File entry not found");
    }

    return file;
  }

  public async getByCode(code: string): Promise<File> {
    const file = await this.prisma.file.findFirst({
      where: {
        accessCode: {
          code,
        },
      },
    });

    if (!file) {
      throw new Error("File entry not found");
    }

    return file;
  }

  public async listByOwnerId(
    ownerId: string,
    options?: {
      status?: $Enums.FileStatus;
      take?: number;
      skip?: number;
      orderBy?: Prisma.FileOrderByWithRelationInput;
    },
  ): Promise<File[]> {
    return this.prisma.file.findMany({
      where: {
        ownerId,
        ...(options?.status && { status: options.status }),
      },
      take: options?.take,
      skip: options?.skip,
      orderBy: options?.orderBy,
    });
  }

  public async listByParentId(
    parentId: string,
    options?: {
      status?: $Enums.FileStatus;
    },
  ): Promise<File[]> {
    return this.prisma.file.findMany({
      where: {
        parentId,
        ...(options?.status && { status: options.status }),
      },
    });
  }

  public async listByFullPath(
    fullPath: string,
    options?: {
      status?: $Enums.FileStatus;
    },
  ): Promise<File[]> {
    return this.prisma.file.findMany({
      where: {
        fullPath: {
          startsWith: fullPath,
        },
        ...(options?.status && { status: options.status }),
      },
      orderBy: {
        fullPath: "asc",
      },
    });
  }

  public async findByNameAndParent(
    name: string,
    parentId: string,
    options?: {
      status?: $Enums.FileStatus;
    },
  ): Promise<File | null> {
    return this.prisma.file.findFirst({
      where: {
        name,
        parentId,
        ...(options?.status && { status: options.status }),
      },
    });
  }

  public async existsByNameAndParent(
    name: string,
    parentId: string,
  ): Promise<boolean> {
    const count = await this.prisma.file.count({
      where: { name, parentId },
    });
    return count > 0;
  }

  public async count(): Promise<number> {
    return this.prisma.file.count();
  }

  public async countAfterCreatedAt(date: Date): Promise<number> {
    const count = await this.prisma.file.count({
      where: {
        createdAt: {
          gte: date,
        },
        status: "ACTIVE",
      },
    });
    return count;
  }

  // 수정
  public async update(
    id: string,
    data: Prisma.FileUncheckedUpdateInput,
  ): Promise<File> {
    return this.prisma.file.update({ where: { id }, data });
  }

  // 삭제
  public async delete(id: string): Promise<File> {
    return this.prisma.file.delete({ where: { id } });
  }
}
