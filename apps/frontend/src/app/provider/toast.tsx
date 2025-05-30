import { ToastContainer } from "react-toastify";
import { useTheme } from "#shadcn/components/ThemeProvider.js";

export function ToastRoot(): JSX.Element {
  const { theme } = useTheme();
  return (
    <ToastContainer
      position="bottom-right"
      autoClose={3000}
      pauseOnHover
      theme={theme === "dark" ? "dark" : "light"}
      closeOnClick
      hideProgressBar
    />
  );
}
