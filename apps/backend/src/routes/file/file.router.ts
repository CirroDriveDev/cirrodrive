import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { fileMetadataPublicDTOSchema } from "@cirrodrive/schemas";
import { router, procedure, authedProcedure } from "@/loaders/trpc.loader.ts";
import { container } from "@/loaders/inversify.loader.ts";
import { S3Service, S3_KEY_PREFIX } from "@/services/s3.service.ts";
import { FileService } from "@/services/file.service.ts";
import { FileAccessCodeService } from "@/services/file-access-code.service.ts";

const s3Service = container.get<S3Service>(S3Service);
const fileAccessCodeService = container.get<FileAccessCodeService>(
  FileAccessCodeService,
);

const fileService = container.get<FileService>(FileService);

export const fileRouter = router({
  getS3PresignedUploadURL: procedure
    .input(z.object({ fileName: z.string() }))
    .output(z.object({ presignedUploadURL: z.string(), key: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { fileName } = input;
      const { user } = ctx;
      const prefix =
        user ? S3_KEY_PREFIX.USER_UPLOADS : S3_KEY_PREFIX.PUBLIC_UPLOADS;
      const key = s3Service.generateS3ObjectKey(prefix, fileName);
      const presignedUploadURL = await s3Service.getPutObjectSignedURL(key);
      return { presignedUploadURL, key };
    }),

  completeUpload: procedure
    .input(z.object({ key: z.string(), folderId: z.string().optional() }))
    .output(z.object({ fileId: z.string(), code: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const { key, folderId } = input;
      const { user } = ctx;
      if (user && !folderId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "로그인한 사용자는 folderId를 제공해야 합니다.",
        });
      }
      const metadata = await s3Service.headObject(key);
      if (!metadata) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "파일을 찾을 수 없습니다.",
        });
      }
      const file = await fileService.createFile({
        name: metadata.name,
        parentId: folderId ?? "root",
        ownerId: user?.id ?? "anonymous",
        mimeType: "application/octet-stream",
        size: metadata.size,
        hash: metadata.hash,
        s3Key: key,
      });
      const code = await fileAccessCodeService.create({ fileId: file.id });
      return {
        fileId: file.id,
        code: code.code,
      };
    }),

  getByCode: procedure
    .input(z.object({ code: z.string() }))
    .output(fileMetadataPublicDTOSchema)
    .query(async ({ input }) => {
      const metadata = await fileService.findFileByCode({ code: input.code });
      if (!metadata) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "코드에 해당하는 파일을 찾을 수 없습니다.",
        });
      }
      return fileMetadataPublicDTOSchema.parse(metadata);
    }),

  saveToAccount: authedProcedure
    .input(z.object({ code: z.string(), folderId: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const { code, folderId } = input;
      const { user } = ctx;
      const fileMetadata = await fileService.findFileByCode({ code });
      if (!fileMetadata) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "코드에 해당하는 파일을 찾을 수 없습니다.",
        });
      }
      await fileService.copy({
        sourceId: fileMetadata.id.toString(),
        targetId: folderId ?? user.rootDirId,
      });
      return { fileId: fileMetadata.id.toString() };
    }),

  trash: authedProcedure
    .input(z.object({ fileId: z.string() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const { fileId } = input;
      const { id: userId } = ctx.user;
      const fileMetadata = await fileService.findFileByCode({ code: fileId });
      if (!fileMetadata) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "파일을 찾을 수 없습니다.",
        });
      }
      if (fileMetadata.ownerId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "파일에 접근할 권한이 없습니다.",
        });
      }
      await fileService.trash({ id: fileId });
      return { success: true };
    }),

  delete: authedProcedure
    .input(z.object({ fileId: z.string() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const { fileId } = input;
      const { id: userId } = ctx.user;
      const fileMetadata = await fileService.findFileByCode({ code: fileId });
      if (!fileMetadata) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "파일을 찾을 수 없습니다.",
        });
      }
      if (fileMetadata.ownerId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "파일에 접근할 권한이 없습니다.",
        });
      }
      await fileService.hardDelete({ id: fileId });
      return { success: true };
    }),
});
