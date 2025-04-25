import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { entryDTOSchema } from "@cirrodrive/schemas";
import { router, authedProcedure } from "@/loaders/trpc.loader.ts";
import { container } from "@/loaders/inversify.loader.ts";
import { FileService } from "@/services/file.service";

const fileService = container.get(FileService);

export const entryRouter = router({
  listByUser: authedProcedure
    .output(entryDTOSchema.array())
    .query(async ({ ctx }) => {
      const { user } = ctx;

      try {
        const entries = await fileService.listFileByUserId({
          userId: user.id,
        });

        return entryDTOSchema.array().parse(entries);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "사용자의 엔트리 목록을 조회하는 중 오류가 발생했습니다.",
          cause: error,
        });
      }
    }),

  // 부모 폴더 ID로 엔트리 목록 조회
  list: authedProcedure
    .input(
      z.object({
        parentFolderId: z.string(),
      }),
    )
    .output(entryDTOSchema.array())
    .query(async ({ input, ctx }) => {
      const { parentFolderId } = input;
      const { user } = ctx;

      const parentFolder = await fileService.getFolderById(parentFolderId);

      if (!parentFolder) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "해당 폴더를 찾을 수 없습니다.",
        });
      }

      if (parentFolder.ownerId !== user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "해당 폴더에 접근할 권한이 없습니다.",
        });
      }

      try {
        const entries = await fileService.listContents({
          id: parentFolderId,
        });

        return entryDTOSchema.array().parse(entries);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "엔트리 목록을 조회하는 중 오류가 발생했습니다.",
          cause: error,
        });
      }
    }),

  // 휴지통 엔트리 목록 조회
  listTrash: authedProcedure
    .output(entryDTOSchema.array())
    .query(async ({ ctx }) => {
      const { user } = ctx;

      try {
        const trashedEntries = await fileService.listTrashEntries({
          userId: user.id,
        });

        return entryDTOSchema.array().parse(trashedEntries);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "휴지통 엔트리 목록을 조회하는 중 오류가 발생했습니다.",
          cause: error,
        });
      }
    }),
});
