import { z } from "zod";
import { fileMetadataDTOSchema } from "./fileMetadata.ts";

export const subFolderDTOSchema = z.object({
  id: z.number(),
  name: z
    .string()
    .min(1, { message: "폴더 이름을 입력해주세요." })
    .max(64, { message: "폴더 이름은 64자 이하로 입력해주세요." }),
  createdAt: z.date(),
  updatedAt: z.date(),
  trashedAt: z.date().nullable(),
  parentFolderId: z.number().nullable(),
  ownerId: z.number().nullable(),
});

export const folderDTOSchema = subFolderDTOSchema.extend({
  subFolders: subFolderDTOSchema.array(),
  files: z.array(fileMetadataDTOSchema),
});

export type SubFolderDTO = z.infer<typeof subFolderDTOSchema>;
export type FolderDTO = z.infer<typeof folderDTOSchema>;
