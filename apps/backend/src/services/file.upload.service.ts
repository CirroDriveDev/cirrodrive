import { type fileMetadataDTOSchema } from "@cirrodrive/schemas";
import { type z } from "zod";

  export class FileService {
    async saveFileMetadata(_metadata: z.infer<typeof fileMetadataDTOSchema>): Promise<void> {
  // TODO: 실제 구현 예정
  
}

}
