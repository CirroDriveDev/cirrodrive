/* eslint-disable unicorn/filename-case -- Todo */
import { getQueryKey, type TRPCClientErrorLike } from "@trpc/react-query";
import type { UseTRPCQueryResult } from "@trpc/react-query/shared";
import type { AppRouter, RouterOutput } from "@cirrodrive/backend/app-router";
import { useEffect, useState } from "react";
import { trpc } from "#services/trpc.js";
import { useModalStore } from "#store/useModalStore.js";

interface UseGetCodeByFileId {
  query: UseTRPCQueryResult<
    RouterOutput["code"]["getByFileId"],
    TRPCClientErrorLike<AppRouter>
  >;
  get: () => void;
}

export const useGetCodeByFileId = (
  fileId: string | null,
): UseGetCodeByFileId => {
  const { openModal } = useModalStore();
  const [clicked, setClicked] = useState(false);
  const query = trpc.code.getByFileId.useQuery(
    {
      fileId: fileId ?? "",
    },
    {
      enabled: false,
    },
  );

  useEffect(() => {
    if (!query.data || !clicked) return;
    openModal({
      title: "코드 공유하기",
      content: (
        <div className="flex-col text-green-500">
          <div>코드: {query.data?.code}</div>
          <div>
            링크:{" "}
            <a
              href={`${window.location.origin}/c/${query.data?.code}`}
              className="text-blue-500 hover:underline"
            >
              {`${window.location.origin}/c/${query.data?.code}`}
            </a>
          </div>
          <div>만료일 : 7일</div>
        </div>
      ),
    });
  }, [openModal, query.data, clicked]);

  const get = async (): Promise<void> => {
    setClicked(true);
    await query.refetch();
  };

  return {
    query,
    get,
  };
};

export const getCodeByFileIdQueryKey = getQueryKey(trpc.entry.list);
