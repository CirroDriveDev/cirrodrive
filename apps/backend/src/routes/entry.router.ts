import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  entryDTOSchema,
  type RecursiveEntryDTO,
  recursiveEntrySchema,
  type EntryDTO,
} from "@cirrodrive/schemas/entry";
import { router, authedProcedure } from "#loaders/trpc.loader";
import { container } from "#loaders/inversify.loader";
import { FolderService } from "#services/folder.service";
import { FileService } from "#services/file.service";

const folderService = container.get(FolderService);
const fileService = container.get(FileService);

export const entryRouter = router({
  // 폴더 ID로 폴더 트리 조회
  getRecursively: authedProcedure
    .input(
      z.object({
        folderId: z.string(),
        includeFiles: z.boolean().default(false),
      }),
    )
    .output(recursiveEntrySchema)
    .query(async ({ input, ctx }) => {
      const { folderId, includeFiles } = input;
      const { user } = ctx;

      const folder = await folderService.get({ folderId });

      if (!folder) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "해당 폴더를 찾을 수 없습니다.",
        });
      }

      if (folder.ownerId !== user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "해당 폴더에 접근할 권한이 없습니다.",
        });
      }

      try {
        const entries = await folderService.getRecursively({
          folderId,
          include: includeFiles ? "entry" : "folder",
        });

        return entries;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "폴더를 재귀적으로 조회하는 중 오류가 발생했습니다.",
          cause: error,
        });
      }
    }),

  listByUser: authedProcedure
    .output(entryDTOSchema.array())
    .query(async ({ ctx }) => {
      const { user } = ctx;

      try {
        const entries = await folderService.getAllSubEntries({
          folderId: user.rootFolderId,
        });

        return entries;
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

      const parentFolder = await folderService.get({
        folderId: parentFolderId,
      });

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
        const folders = await folderService.listByParentFolder({
          parentFolderId,
        });
        const files = await fileService.listFileMetadataByParentFolder({
          parentFolderId,
        });

        const folderEntries: EntryDTO[] = folders
          .filter((folder) => !folder.trashedAt)
          .map((folder) => ({
            id: folder.id,
            name: folder.name,
            type: "folder" as const, // Explicitly type as "folder"
            parentFolderId: folder.parentFolderId,
            createdAt: folder.createdAt,
            updatedAt: folder.updatedAt,
            trashedAt: folder.trashedAt,
            size: null,
          }));

        const filesEntries: EntryDTO[] = files
          .filter((file) => !file.trashedAt)
          .map((file) => ({
            id: file.id,
            name: file.name,
            type: "file" as const, // Explicitly type as "file"
            parentFolderId: file.parentFolderId,
            createdAt: file.createdAt,
            updatedAt: file.updatedAt,
            trashedAt: file.trashedAt,
            size: file.size,
          }));

        const entries: EntryDTO[] = [...folderEntries, ...filesEntries];

        return entries;
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
        const trashedFolders = await folderService.listTrashByUser({
          ownerId: user.id,
        });
        const trashedFiles = await fileService.listTrashByUser({
          ownerId: user.id,
        });

        const folderEntries: EntryDTO[] = trashedFolders.map((folder) => ({
          id: folder.id,
          name: folder.name,
          type: "folder",
          parentFolderId: folder.parentFolderId,
          createdAt: folder.createdAt,
          updatedAt: folder.updatedAt,
          trashedAt: folder.trashedAt,
          size: null,
        }));

        const filesEntries: EntryDTO[] = trashedFiles.map((file) => ({
          id: file.id,
          name: file.name,
          type: "file",
          parentFolderId: file.parentFolderId,
          createdAt: file.createdAt,
          updatedAt: file.updatedAt,
          trashedAt: file.trashedAt,
          size: file.size,
        }));

        const trashedEntries: EntryDTO[] = [...folderEntries, ...filesEntries];

        return trashedEntries;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "휴지통 엔트리 목록을 조회하는 중 오류가 발생했습니다.",
          cause: error,
        });
      }
    }),
  search: authedProcedure
    .input(
      z.object({
        searchTerm: z.string(), // 검색어
      }),
    )
    .output(entryDTOSchema.array())
    .query(async ({ input, ctx }) => {
      const { searchTerm } = input;
      const { user } = ctx;

      try {
        // 모든 하위 엔트리 포함 (파일 + 폴더 재귀 조회)
        const recursiveEntries = await folderService.getRecursively({
          folderId: user.rootFolderId,
          include: "entry", // 폴더와 파일 모두 포함
        });

        // 평탄화 함수: 재귀적으로 모든 엔트리를 평탄화
        const flattenEntries = (entry: RecursiveEntryDTO): EntryDTO[] => {
          const entries: EntryDTO[] = [];

          if (entry.type === "folder" && entry.entries) {
            for (const subEntry of entry.entries) {
              entries.push(...flattenEntries(subEntry));
            }
          }

          // 명시적으로 타입 변환 처리
          const entryDTO: EntryDTO =
            entry.type === "folder" ?
              {
                id: entry.id,
                name: entry.name,
                type: "folder",
                parentFolderId: entry.parentFolderId,
                createdAt: entry.createdAt,
                updatedAt: entry.updatedAt,
                trashedAt: entry.trashedAt,
                size: null, // 폴더는 항상 null
              }
            : {
                id: entry.id,
                name: entry.name,
                type: "file",
                parentFolderId: entry.parentFolderId,
                createdAt: entry.createdAt,
                updatedAt: entry.updatedAt,
                trashedAt: entry.trashedAt,
                size: entry.size, // 파일은 숫자 값
              };

          entries.push(entryDTO);

          return entries;
        };

        const allEntries = flattenEntries(recursiveEntries);

        // 검색어로 필터링
        const lowerSearch = searchTerm.toLowerCase();
        const filtered = allEntries.filter((entry) =>
          entry.name.toLowerCase().includes(lowerSearch),
        );

        return filtered;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "검색 중 오류가 발생했습니다.",
          cause: error,
        });
      }
    }),
});
