import { z } from "zod"; // zod 임포트
import { TRPCError } from "@trpc/server"; // TRPCError 임포트
import {
  folderDTOSchema,
  subFolderDTOSchema,
} from "@cirrodrive/schemas/folder";
import { router, authedProcedure } from "#loaders/trpc.loader"; // tRPC 설정 임포트
import { container } from "#loaders/inversify.loader";
import { FolderService } from "#services/folder.service";

const folderService = container.get(FolderService);

export const folderRouter = router({
  // 새로운 폴더 생성
  create: authedProcedure
    .input(
      z.object({
        name: subFolderDTOSchema.shape.name,
        parentFolderId: subFolderDTOSchema.shape.id,
      }),
    )
    .output(subFolderDTOSchema)
    .mutation(async ({ input, ctx }) => {
      const { name, parentFolderId } = input;

      const newFolder = await folderService.create({
        ownerId: ctx.user.id,
        name,
        parentFolderId,
      });

      return newFolder;
    }),

  listByParentFolder: authedProcedure
    .input(
      z.object({
        parentFolderId: z.string(),
      }),
    )
    .output(folderDTOSchema.array())
    .query(async ({ input }) => {
      const { parentFolderId } = input;

      const folders = await folderService.listByParentFolder({
        parentFolderId,
      });

      return folders;
    }),

  // 회원의 폴더 목록 조회
  listByUser: authedProcedure
    .input(
      z.object({
        ownerId: z.string(),
        parentFolderId: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const { ownerId, parentFolderId } = input;

      // folderService에서 사용자와 부모 폴더에 맞는 폴더 목록을 조회
      const folders = await folderService.listByUser({
        ownerId,
        parentFolderId,
      });

      // 반환할 데이터를 folderDTOSchema 형식에 맞게 변환
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
        folderId: z.string(),
      }),
    )
    .output(folderDTOSchema)
    .query(async ({ input, ctx }) => {
      const { folderId } = input;

      const { user } = ctx;

      if (
        !(await folderService.isOwner({
          userId: user.id,
          folderId: input.folderId,
        }))
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "폴더에 접근할 권한이 없습니다.",
        });
      }

      const folder = await folderService.get({
        folderId,
      });

      if (!folder) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "해당 폴더를 찾을 수 없습니다.",
        });
      }

      return folder;
    }),

  // 폴더 경로 조회
  getPath: authedProcedure
    .input(
      z.object({
        folderId: z.string(),
      }),
    )
    .output(
      z.array(
        z.object({
          folderId: z.string().nullable(),
          name: z.string(),
        }),
      ),
    )
    .query(async ({ input }) => {
      const { folderId } = input;

      const path = await folderService.getPath({
        folderId,
      });

      return path;
    }),

  // 폴더 이름 변경
  rename: authedProcedure
    .input(
      z.object({
        folderId: z.string(), // 이름을 변경할 폴더의 ID
        name: z.string(), // 변경할 이름
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { folderId, name } = input;
      const { user } = ctx;

      try {
        const folder = await folderService.get({
          folderId,
        });

        if (user.id !== folder?.ownerId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "폴더 이름을 변경할 권한이 없습니다.",
          });
        }

        await folderService.rename({
          folderId,
          targetName: name,
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "폴더 이름을 변경하는 중 오류가 발생했습니다.",
          cause: error,
        });
      }
    }),

  // 폴더 삭제
  delete: authedProcedure
    .input(
      z.object({
        folderId: z.string(), // 삭제할 폴더의 ID
      }),
    )
    .output(
      z.object({
        success: z.boolean(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { folderId } = input;
      const { id: userId } = ctx.user;

      try {
        // 폴더 및 하위 파일/폴더 삭제
        await folderService.deleteFolder({
          folderId,
          userId,
        });

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "폴더를 삭제하는 중 오류가 발생했습니다.",
          cause: error,
        });
      }
    }),
  // 폴더 휴지통으로 이동
  trash: authedProcedure
    .input(
      z.object({
        folderId: z.string(), // 휴지통으로 옮길 폴더의 ID
      }),
    )
    .output(
      z.object({
        success: z.boolean(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { folderId } = input;
      const { id: userId } = ctx.user;

      try {
        // 폴더 및 하위 파일/폴더를 휴지통으로 이동
        await folderService.moveToTrash({
          folderId,
          userId,
        });

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "폴더를 휴지통으로 이동하는 중 오류가 발생했습니다.",
          cause: error,
        });
      }
    }),
  restoreFromTrash: authedProcedure
    .input(
      z.object({
        folderId: z.string(), // 복원할 폴더의 ID
      }),
    )
    .output(
      z.object({
        success: z.boolean(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { folderId } = input;
      const { id: userId } = ctx.user;

      try {
        // 폴더 및 하위 파일/폴더를 복원
        await folderService.restoreFromTrash({
          folderId,
          userId,
        });

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "폴더를 복원하는 중 오류가 발생했습니다.",
          cause: error,
        });
      }
    }),
  move: authedProcedure
    .input(
      z.object({
        sourceFolderId: z.string(), // 이동할 폴더 ID
        targetFolderId: z.string(), // 타겟 폴더 ID
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { sourceFolderId, targetFolderId } = input;

      // 폴더 이동 처리
      try {
        // 폴더 이동
        await folderService.moveFolder({
          ownerId: ctx.user.id,
          sourceFolderId,
          targetFolderId,
        });

        return { message: "폴더가 성공적으로 이동되었습니다." };
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message,
          });
        }
        throw error;
      }
    }),
});
