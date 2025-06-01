import { useBoundStore } from "./useBoundStore";

/**
 * 리다이렉트 경로 전용 store hook
 *
 * @example const { redirectPath, setRedirectPath, clearRedirectPath } =
 * useRedirectStore();
 */
export const useRedirectStore = () =>
  useBoundStore((state) => ({
    redirectPath: state.redirectPath,
    setRedirectPath: state.setRedirectPath,
    clearRedirectPath: state.clearRedirectPath,
  }));
