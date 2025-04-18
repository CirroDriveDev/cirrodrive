/* eslint-disable @typescript-eslint/require-await -- Not implemented */
import { injectable } from "inversify";

@injectable()
export class DirectoryService {
  public async createDirectory(_path: string): Promise<void> {
    throw new Error("Not implemented.");
  }

  public async renameDirectory(_path: string, _newName: string): Promise<void> {
    throw new Error("Not implemented.");
  }

  public async moveDirectory(
    _sourcePath: string,
    _targetPath: string,
  ): Promise<void> {
    throw new Error("Not implemented.");
  }

  public async deleteDirectory(_path: string): Promise<void> {
    throw new Error("Not implemented.");
  }

  public async listDirectoryContents(_path: string): Promise<unknown[]> {
    throw new Error("Not implemented.");
  }
}
