import { z } from "zod";

export const codeSchema = z.object({
  id: z.coerce.number(),
  fileId: z.coerce.number(),
  codeString: z.string(),
  expiresAt: z.coerce.date(),
});
