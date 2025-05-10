import { z } from "zod";

export const codeSchema = z.object({
  id: z.string(),
  fileId: z.string(),
  codeString: z.string(),
  expiresAt: z.date(),
});
