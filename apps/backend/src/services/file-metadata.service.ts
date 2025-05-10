/* eslint-disable @typescript-eslint/require-await -- Not implemented */
import { injectable } from "inversify";

@injectable()
export class FileMetadataService {
  public async createFileEntry(_data: unknown): Promise<void> {
    throw new Error("Not implemented.");
  }

  public async getFileEntry(_fileId: string): Promise<unknown> {
    throw new Error("Not implemented.");
  }

  public async updateFileEntry(
    _fileId: string,
    _updates: unknown,
  ): Promise<void> {
    throw new Error("Not implemented.");
  }

  public async deleteFileEntry(_fileId: string): Promise<void> {
    throw new Error("Not implemented.");
  }

  public async listFilesInDirectory(_directoryId: string): Promise<unknown[]> {
    throw new Error("Not implemented.");
  }

  public async listRecursive(_prefix: string): Promise<unknown[]> {
    throw new Error("Not implemented.");
  }
}
