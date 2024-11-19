import { z } from "zod";

export const folderSchema = z.object({
  id: z.coerce.number(),
  name: z
    .string()
    .min(1, { message: "폴더 이름을 입력해주세요." })
    .max(64, { message: "폴더 이름은 64자 이하로 입력해주세요." }),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  parentFolderId: z.coerce.number().optional(),
  ownerId: z.coerce.number().optional(),
});

export const folderDTOSchema = folderSchema;

export const folderPublicDTOSchema = folderSchema.pick({
  id: true,
  name: true,
  createdAt: true,
  updatedAt: true,
  parentFolderId: true,
});

export type FolderDTO = z.infer<typeof folderDTOSchema>;
export type FolderPublicDTO = z.infer<typeof folderPublicDTOSchema>;
