import { z } from "zod";

export const codeSchema = z.object({
  id: z.number(),
  fileId: z.string(),
  codeString: z.string(),
  expiresAt: z.date(),
});
