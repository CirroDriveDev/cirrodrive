import { useUserView } from "@/features/admin/userView/model.ts";
import { useUserAdd } from "@/features/admin/userAdd/model.ts";
import { useUserEdit } from "@/features/admin/userEdit/model.ts";

// 사용자 관리 훅
export const useUsers = (): {
  getUserById: ReturnType<typeof useUserView>["getUserById"];
  addUser: ReturnType<typeof useUserAdd>["addUser"];
  updateUser: ReturnType<typeof useUserEdit>["updateUser"];
} => {
  const { getUserById } = useUserView();
  const { addUser } = useUserAdd();
  const { updateUser } = useUserEdit();

  return {
    getUserById,
    addUser,
    updateUser,
  };
};
