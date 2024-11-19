import { createBrowserRouter, Navigate } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import { HomePage } from "@/pages/home/ui/HomePage.tsx";
import { LoginPage } from "@/pages/login/ui/LoginPage.tsx";
import { RegisterPage } from "@/pages/register/ui/RegisterPage.tsx";
import { LandingPage } from "@/pages/landing/ui/LandingPage.tsx";
import { UploadPage } from "@/pages/upload/ui/UploadPage.tsx";
import { DownloadPage } from "@/pages/download/ui/DownloadPage.tsx";
import { CodePage } from "@/pages/upload/ui/CodePage.tsx";
import { FolderContentPage } from "@/pages/folderContent/ui/FolderContentPage.tsx";
import { useBoundStore } from "@/shared/store/useBoundStore.ts";

function RedirectAuthedUserToHome({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  const { user } = useBoundStore();
  return user ? <Navigate to="/home" replace /> : children;
}

function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  const { user } = useBoundStore();
  return user ? children : <Navigate to="/login" replace />;
}

const routeTree: RouteObject[] = [
  {
    path: "/",
    element: (
      <RedirectAuthedUserToHome>
        <LandingPage />
      </RedirectAuthedUserToHome>
    ),
  },
  {
    path: "/home",
    element: (
      <RequireAuth>
        <HomePage />
      </RequireAuth>
    ),
  },
  {
    path: "/login",
    element: (
      <RedirectAuthedUserToHome>
        <LoginPage />
      </RedirectAuthedUserToHome>
    ),
  },
  {
    path: "/register",
    element: (
      <RedirectAuthedUserToHome>
        <RegisterPage />
      </RedirectAuthedUserToHome>
    ),
  },
  {
    path: "/upload",
    element: <UploadPage />,
  },
  {
    path: "/download",
    element: <DownloadPage />,
  },
  {
    path: "/code",
    element: <CodePage />,
  },
  {
    path: "/FolderContent",
    element: <FolderContentPage />,
  },
];

export const router = createBrowserRouter(routeTree);
