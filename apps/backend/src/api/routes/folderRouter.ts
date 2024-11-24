import { z } from "zod"; // zod 임포트
import { TRPCError } from "@trpc/server"; // TRPCError 임포트
import { folderDTOSchema, subFolderDTOSchema } from "@cirrodrive/schemas";
import { router, procedure, authedProcedure } from "@/loaders/trpc.ts"; // tRPC 설정 임포트
import { container } from "@/loaders/inversify.ts";
import { FolderService } from "@/services/folderService.ts";

const folderService = container.get(FolderService);

export const folderRouter = router({
  // 새로운 폴더 생성
  create: authedProcedure
    .input(
      z.object({
        name: z.string(),
        parentFolderId: z.number().optional(),
      }),
    )
    .output(subFolderDTOSchema)
    .mutation(async ({ input, ctx }) => {
      const { name, parentFolderId } = input;

      const newFolder = await folderService.create(
        ctx.user.id,
        name,
        parentFolderId,
      );

      return newFolder;
    }),

  listByParentFolder: authedProcedure
    .input(
      z.object({
        folderId: z.number(),
      }),
    )
    .output(folderDTOSchema.array())
    .query(async ({ input }) => {
      const { folderId } = input;

      const folders = await folderService.listByParentFolder(folderId);

      return folders;
    }),

  // 회원의 폴더 목록 조회
  listByUser: procedure
    .input(
      z.object({
        id: z.number(),
        parentFolderId: z.number().optional(),
      }),
    )
    .query(async ({ input }) => {
      const { id, parentFolderId } = input;

      const folders = await folderService.listByUser(id, parentFolderId);

      return folders.map((folder) => ({
        folderId: folder.id,
        name: folder.name,
        parentId: folder.parentFolderId,
        createdAt: folder.createdAt,
      }));
    }),

  // 특정 폴더 조회
  get: authedProcedure
    .input(
      z.object({
        folderId: z.number(),
      }),
    )
    .output(folderDTOSchema)
    .query(async ({ input, ctx }) => {
      const { folderId } = input;

      const { user } = ctx;

      if (
        !(await folderService.isOwner({
          userId: user.id,
          folderId,
        }))
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "폴더에 접근할 권한이 없습니다.",
        });
      }

      const folder = await folderService.get(folderId);

      if (!folder) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "해당 폴더를 찾을 수 없습니다.",
        });
      }

      return folder;
    }),

  // 폴더 삭제
  delete: authedProcedure
    .input(
      z.object({
        id: z.number(), // 회원의 ID
        folderId: z.number(), // 삭제할 폴더 ID
      }),
    )
    .mutation(async ({ input }) => {
      const { id, folderId } = input;

      try {
        // 폴더 내 파일이나 하위 폴더가 있는지 확인
        const folder = await folderService.get(folderId);

        if (!folder) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "해당 폴더를 찾을 수 없습니다.",
          });
        }

        // 폴더에 파일이나 하위 폴더가 없으면 바로 삭제
        if (folder.files.length === 0 && folder.subFolders.length === 0) {
          await folderService.delete(id, folderId);
        } else {
          // 파일이나 하위 폴더가 있으면 휴지통 처리 (휴지통 로직은 생략)
          await folderService.moveToTrash(id, folderId);
        }
      } catch (error: unknown) {
        if (
          error instanceof Error &&
          error.message.includes("Record to delete does not exist.")
        ) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "해당 폴더를 찾을 수 없습니다.",
          });
        }
        throw error;
      }
    }),
});
