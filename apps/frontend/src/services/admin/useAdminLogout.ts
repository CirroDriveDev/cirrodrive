import { useNavigate } from "react-router";
import { useAdminStore } from "#store/useAdminStore.js";
import { trpc } from "#services/trpc.js";

export function useAdminLogout() {
  const { clearAdmin } = useAdminStore();
  const navigate = useNavigate();

  const logoutMutation = trpc.protected.session.logout.useMutation({
    onSettled: () => {
      clearAdmin();
      void navigate("/admin/login", { replace: true });
    },
  });

  const logout = () => {
    logoutMutation.mutate();
  };

  return { logout };
}
