import { z } from "zod";

export const fileSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  size: z.coerce.number(),
  extension: z.string(),
  hash: z.string(),
  savedPath: z.string(),
});

export type FileMetadata = z.infer<typeof fileSchema>;
