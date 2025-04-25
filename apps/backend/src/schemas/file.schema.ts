import { z } from "zod";

export const FileStatus = z.enum(["ACTIVE", "TRASHED", "ARCHIVED"]);

export const FileSchema = z.object({
  id: z.string(),
  ownerId: z.string().nullable(),
  parentId: z.string().nullable(),
  name: z.string(),
  isDir: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  s3Key: z.string().nullable(),
  size: z.number().nullable(),
  mimeType: z.string().nullable(),
  hash: z.string().nullable(),
  status: FileStatus,
  trashedAt: z.date().nullable(),
  archivedAt: z.date().nullable(),
});

export const DirectorySchema = FileSchema.extend({
  isDir: z.literal(true),
  size: z.literal(null),
  mimeType: z.literal(null),
  hash: z.literal(null),
  s3Key: z.literal(null),
});

export const FileDataSchema = FileSchema.extend({
  isDir: z.literal(false),
  size: z.number(),
  mimeType: z.string(),
  hash: z.string(),
  s3Key: z.string(),
});
