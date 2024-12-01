import { z } from "zod";

const baseEntrySchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.enum(["file", "folder"]),
  parentFolderId: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  trashedAt: z.date().nullable(),
  size: z.number(),
});

const fileEntrySchema = baseEntrySchema.extend({
  type: z.literal("file"),
});

const folderEntrySchema = baseEntrySchema.extend({
  type: z.literal("folder"),
  size: z.null(),
});

export const entryDTOSchema = z.union([fileEntrySchema, folderEntrySchema]);

export type EntryDTO = z.infer<typeof entryDTOSchema>;

export const recursiveEntrySchema: z.ZodType<RecursiveEntryDTO> =
  folderEntrySchema.extend({
    entries: z.lazy(() => recursiveEntrySchema.array().optional()),
  });

export type RecursiveEntryDTO = z.infer<typeof entryDTOSchema> & {
  entries?: RecursiveEntryDTO[];
};
