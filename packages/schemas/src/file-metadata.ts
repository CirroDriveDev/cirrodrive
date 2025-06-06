import { z } from "zod";

export const fileMetadataSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(1, { message: "파일 이름을 입력해주세요." })
    .max(64, { message: "파일 이름은 64자 이하로 입력해주세요." }),
  size: z.bigint(),
  extension: z.string(),
  hash: z.string(),
  savedPath: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  trashedAt: z.date().nullable(),
  parentFolderId: z.string().nullable(),
  ownerId: z.string().nullable(),
});

export const fileMetadataDTOSchema = fileMetadataSchema.omit({
  hash: true,
  savedPath: true,
});

export const fileMetadataPublicDTOSchema = fileMetadataSchema.pick({
  id: true,
  name: true,
  size: true,
  extension: true,
  createdAt: true,
  updatedAt: true,
});

export type FileMetadataDTO = z.infer<typeof fileMetadataDTOSchema>;
export type FileMetadataPublicDTO = z.infer<typeof fileMetadataPublicDTOSchema>;
