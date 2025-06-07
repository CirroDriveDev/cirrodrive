/* eslint-disable unicorn/filename-case -- Todo */
import type { EntryDTO } from "@cirrodrive/schemas/entry";
import { trpc } from "#services/trpc.js";
import { entryUpdatedEvent } from "#services/entryUpdatedEvent.js";
import { useModalStore } from "#store/useModalStore.js";
import { useUserStore } from "#store/useUserStore.js";
import { EntryTreeNode } from "#components/EntryTreeNode.js";
import { useEntryGetRecursively } from "#services/useEntryGetRecursively.js";
import { toast } from "sonner";

interface UseMoveManyEntries {
  openMoveManyModal: () => void;
}

export const useMoveManyEntries = (entries: EntryDTO[]): UseMoveManyEntries => {
  const { user } = useUserStore();
  const { query: recursiveEntryQuery } = useEntryGetRecursively(user!.rootFolderId);
  const { openModal, closeModal } = useModalStore();

  const fileMoveMutation = trpc.file.move.useMutation();
  const folderMoveMutation = trpc.folder.move.useMutation();

  const openMoveManyModal = (): void => {
    openModal({
      title: "선택한 항목 이동",
      content: (
        <>
          {recursiveEntryQuery.data ? (
            <EntryTreeNode
              entry={recursiveEntryQuery.data}
              isOpened
              onClick={async (e, clickedEntry) => {
                e.stopPropagation();

                const moveTargets = entries.filter((entry) => {
                  if (entry.id === clickedEntry.id) {
                    toast.warning(`"${entry.name}"은(는) 자기 자신으로 이동할 수 없습니다.`);
                    return false;
                  }

                  if (entry.parentFolderId === clickedEntry.id) {
                    toast.info(`"${entry.name}"은(는) 이미 해당 위치에 있습니다.`);
                    return false;
                  }

                  return true;
                });

                if (moveTargets.length === 0) {
                  toast.info("이동할 항목이 없습니다.");
                  return;
                }

                try {
                  await Promise.all(
                    moveTargets.map((entry) =>
                      entry.type === "file"
                        ? fileMoveMutation.mutateAsync({
                            fileId: entry.id,
                            targetFolderId: clickedEntry.id,
                          })
                        : folderMoveMutation.mutateAsync({
                            sourceFolderId: entry.id,
                            targetFolderId: clickedEntry.id,
                          })
                    )
                  );

                  await entryUpdatedEvent();
                  toast.success("이동이 완료되었습니다.");
                  closeModal();
                } catch (err) {
                  toast.error("이동 중 오류가 발생했습니다.");
                  console.error(err);
                }
              }}
            />
          ) : null}
        </>
      ),
    });
  };

  return {
    openMoveManyModal,
  };
};
