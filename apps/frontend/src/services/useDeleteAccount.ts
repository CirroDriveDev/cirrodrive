import { trpc } from "#services/trpc.js";
import { useBoundStore } from "#store/useBoundStore.js";

export const useDeleteAccount = (): { deleteAccount: () => Promise<void> } => {
  const { clearUser } = useBoundStore();
  const deleteAccountMutation = trpc.user.delete.useMutation();

  const deleteAccount = async (): Promise<void> => {
    try {
      await deleteAccountMutation.mutateAsync();
      clearUser(); // 사용자 정보 초기화
    } catch (error) {
      // eslint-disable-next-line no-alert -- 테스트용입니다.
      alert("계정 삭제 중 오류가 발생했습니다.");
      throw error;
    }
  };

  return { deleteAccount };
};
