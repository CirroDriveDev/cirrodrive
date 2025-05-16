import { z } from "zod";

export const fileAccessCodeSchema = z.object({
  id: z.number(),
  code: z.string(),
  expiresAt: z.date(),
  fileId: z.string(),
});
