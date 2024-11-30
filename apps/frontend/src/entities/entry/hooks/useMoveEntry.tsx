/* eslint-disable unicorn/filename-case -- 리액트 훅 파일명은 camelCase로 작성합니다. */
import type { EntryDTO } from "@cirrodrive/schemas";
import { trpc } from "@/shared/api/trpc.ts";
import { useEntryUpdatedEvent } from "@/entities/entry/api/useEntryUpdatedEvent.ts";
import { useModalStore } from "@/shared/store/useModalStore.ts";
import { useUserStore } from "@/shared/store/useUserStore.ts";
import { EntryTreeNode } from "@/entities/entry/ui/EntryTreeNode.tsx";
import { useEntryGetRecursively } from "@/entities/entry/api/useEntryGetRecursively.ts";

interface UseMoveEntry {
  openMoveModal: () => void;
}

export const useMoveEntry = (entry: EntryDTO): UseMoveEntry => {
  const { entryUpdatedEvent } = useEntryUpdatedEvent();
  const { user } = useUserStore();
  const { query: recursiveEntryQuery } = useEntryGetRecursively(
    user!.rootFolderId,
  );

  const { openModal, closeModal } = useModalStore();

  const fileMoveMutation = trpc.file.move.useMutation({
    onSuccess: async () => {
      await entryUpdatedEvent();
    },
  });

  const folderMoveMutation = trpc.folder.move.useMutation({
    onSuccess: async () => {
      await entryUpdatedEvent();
    },
  });

  const openMoveModal = (): void => {
    openModal({
      title: "이동",
      content: (
        <>
          {recursiveEntryQuery.data ?
            <EntryTreeNode
              entry={recursiveEntryQuery?.data}
              onClick={(e, clickedEntry) => {
                e.stopPropagation();
                if (entry.type === "file") {
                  fileMoveMutation.mutate({
                    fileId: entry.id,
                    targetFolderId: clickedEntry.id,
                  });
                } else {
                  folderMoveMutation.mutate({
                    sourceFolderId: entry.id,
                    targetFolderId: clickedEntry.id,
                  });
                }
                closeModal();
              }}
              isOpened
            />
          : null}
        </>
      ),
    });
  };

  return {
    openMoveModal,
  };
};
