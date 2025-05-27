import { injectable } from "inversify";
import { Prisma, FileMetadata } from "@cirrodrive/database/prisma";
import { BaseRepository } from "#repositories/base.repository";
import { DBNotFoundError } from "#errors/db-error-classes";

@injectable()
export class FileMetadataRepository extends BaseRepository {
  // 파일 메타데이터 생성
  public async create(
    data: Prisma.FileMetadataUncheckedCreateInput,
  ): Promise<FileMetadata> {
    return this.prisma.fileMetadata.create({ data });
  }

  // 파일 메타데이터 id로 조회
  public async getById(id: string): Promise<FileMetadata> {
    const result = await this.prisma.fileMetadata.findUnique({ where: { id } });
    if (!result) {
      throw new DBNotFoundError("FileMetadata", { id });
    }
    return result;
  }

  // 파일 메타데이터 key로 조회
  public async getByKey(key: string): Promise<FileMetadata> {
    const result = await this.prisma.fileMetadata.findUnique({
      where: { key },
    });
    if (!result) {
      throw new DBNotFoundError("FileMetadata (key)", { key });
    }
    return result;
  }

  // 메타데이터 업데이트
  public async updateById(
    id: string,
    data: Prisma.FileMetadataUpdateInput,
  ): Promise<FileMetadata> {
    return this.prisma.fileMetadata.update({ where: { id }, data });
  }

  // 메타데이터 삭제
  public async deleteById(id: string): Promise<FileMetadata> {
    return this.prisma.fileMetadata.delete({ where: { id } });
  }
}
