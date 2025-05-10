import { injectable } from "inversify";
import { FileAccessCode, Prisma } from "@cirrodrive/database";
import { BaseRepository } from "@/repositories/base.repository.ts";

@injectable()
export class FileAccessCodeRepository extends BaseRepository {
  // create
  public async create(
    data: Prisma.FileAccessCodeUncheckedCreateInput,
  ): Promise<FileAccessCode> {
    return this.prisma.fileAccessCode.create({ data });
  }

  // read
  public async getByCode(code: string): Promise<FileAccessCode | null> {
    return this.prisma.fileAccessCode.findUnique({
      where: { code },
    });
  }

  public async findByFileId(fileId: string): Promise<FileAccessCode | null> {
    return this.prisma.fileAccessCode.findUnique({
      where: { fileId },
    });
  }

  public async listByFileOwnerId(userId: string): Promise<FileAccessCode[]> {
    return this.prisma.fileAccessCode.findMany({
      where: {
        file: {
          ownerId: userId,
        },
      },
    });
  }

  // update

  // delete
  public async deleteByCode(code: string): Promise<FileAccessCode> {
    return this.prisma.fileAccessCode.delete({
      where: { code },
    });
  }
}
