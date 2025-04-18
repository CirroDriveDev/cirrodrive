/* eslint-disable @typescript-eslint/require-await -- Not implemented */
import { injectable } from "inversify";

@injectable()
export class PermissionService {
  public async checkReadAccess(_userId: string, _path: string): Promise<void> {
    throw new Error("Not implemented.");
  }

  public async checkWriteAccess(_userId: string, _path: string): Promise<void> {
    throw new Error("Not implemented.");
  }

  public async isOwner(_userId: string, _resourceId: string): Promise<boolean> {
    throw new Error("Not implemented.");
  }

  public async listSharedWith(_userId: string): Promise<string[]> {
    throw new Error("Not implemented.");
  }
}
