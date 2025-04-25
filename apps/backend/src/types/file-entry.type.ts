import type { z } from "zod";
import type { DirectorySchema, FileDataSchema } from "@/schemas/file.schema.ts";

export type Directory = z.infer<typeof DirectorySchema>;
export type FileData = z.infer<typeof FileDataSchema>;

export type File = Directory | FileData;
