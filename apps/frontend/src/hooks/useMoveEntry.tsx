/* eslint-disable unicorn/filename-case -- Todo */
import type { EntryDTO } from "@cirrodrive/schemas/entry";
import { trpc } from "#services/trpc.js";
import { entryUpdatedEvent } from "#services/entryUpdatedEvent.js";
import { useModalStore } from "#store/useModalStore.js";
import { useUserStore } from "#store/useUserStore.js";
import { EntryTreeNode } from "#components/EntryTreeNode.js";
import { useEntryGetRecursively } from "#services/useEntryGetRecursively.js";

interface UseMoveEntry {
  openMoveModal: () => void;
}

export const useMoveEntry = (entry: EntryDTO): UseMoveEntry => {
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
