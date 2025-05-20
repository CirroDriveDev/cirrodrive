import { injectable } from "inversify";
import { type FileAccessCode, Prisma } from "@cirrodrive/database/prisma";
import { BaseRepository } from "#repositories/base.repository.js";
import { NotFoundError } from "#errors/error-classes.js";

@injectable()
export class FileAccessCodeRepository extends BaseRepository {
  // Create
  public async create(
    data: Prisma.FileAccessCodeUncheckedCreateInput,
  ): Promise<FileAccessCode> {
    return await this.prisma.fileAccessCode.create({ data });
  }

  // Read
  public async getByCode(code: string): Promise<FileAccessCode> {
    const result = await this.prisma.fileAccessCode.findUnique({
      where: { code },
    });
    if (!result) throw new NotFoundError("FileAccessCode (code)", { code });
    return result;
  }

  public async getByFileId(fileId: string): Promise<FileAccessCode> {
    const result = await this.prisma.fileAccessCode.findUnique({
      where: { fileId },
    });
    if (!result) throw new NotFoundError("FileAccessCode (fileId)", { fileId });
    return result;
  }

  public async listByFileOwnerId(userId: string): Promise<FileAccessCode[]> {
    return await this.prisma.fileAccessCode.findMany({
      where: {
        file: {
          ownerId: userId,
        },
      },
    });
  }

  // Update

  // Delete
  public async deleteByCode(code: string): Promise<FileAccessCode> {
    return await this.prisma.fileAccessCode.delete({
      where: { code },
    });
  }
}
