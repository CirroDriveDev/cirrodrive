import { inject, injectable } from "inversify";
import { generateSafeFileName } from "@/utils/generate-safe-file-name.ts";
import { FileRepository } from "@/repositories/file.repository.ts";

@injectable()
export class FileDomainService {
  constructor(
    @inject(FileRepository)
    private readonly fileRepository: FileRepository,
  ) {}

  public async ensureSafeFileName({
    fileName,
    parentId,
  }: {
    fileName: string;
    parentId: string;
  }): Promise<string> {
    const existingNames = (
      await this.fileRepository.listByParentId(parentId)
    ).map((entry) => entry.name);

    const sanitizedFileName = generateSafeFileName({
      fileName,
      existingNames,
    });

    return sanitizedFileName;
  }
}
