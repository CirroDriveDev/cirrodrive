import { inputUserDataSchema, outputUserDataSchema } from "@cirrodrive/types";
import { z } from "zod";
import { container } from "@/loaders/inversify.ts";
import { UserService } from "@/services/userService.ts";
import { logger } from "@/loaders/logger.ts";
import { router, procedure, authedProcedure } from "@/loaders/trpc.ts";

const userService = container.get<UserService>(UserService);

export const userRouter = router({
  create: procedure
    .input(inputUserDataSchema)
    .output(outputUserDataSchema)
    .mutation(async ({ input, ctx }) => {
      logger.info({ requestId: ctx.req.id }, "createUser 요청 시작");

      const user = await userService.create(
        input.username,
        input.password,
        input.email,
      );

      return user;
    }),

  list: procedure
    .input(
      z.object({
        limit: z.coerce.number().optional().default(10),
        offset: z.coerce.number().optional().default(0),
      }),
    )
    .output(z.array(outputUserDataSchema))
    .query(async ({ input, ctx }) => {
      logger.info({ requestId: ctx.req.id }, "getUsers 요청 시작");

      const users = await userService.list(input.limit, input.offset);

      return users;
    }),

  me: authedProcedure.output(outputUserDataSchema).query(({ ctx }) => {
    logger.info({ requestId: ctx.req.id }, "getUser 요청 시작");
    return ctx.user;
  }),

  update: authedProcedure
    .input(inputUserDataSchema)
    .output(outputUserDataSchema)
    .mutation(async ({ input, ctx }) => {
      logger.info({ requestId: ctx.req.id }, "updateUser 요청 시작");

      const user = await userService.update(
        ctx.user.id,
        input.username,
        input.password,
        input.email,
      );

      return user;
    }),

  delete: authedProcedure
    .output(outputUserDataSchema)
    .mutation(async ({ ctx }) => {
      logger.info({ requestId: ctx.req.id }, "deleteUser 요청 시작");

      const user = await userService.delete(ctx.user.id);

      return user;
    }),
});
