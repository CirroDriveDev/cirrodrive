import { createBrowserRouter, Navigate } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import { HomePage } from "@/pages/home/ui/HomePage.tsx";
import { LoginPage } from "@/pages/login/ui/LoginPage.tsx";
import { RegisterPage } from "@/pages/register/ui/RegisterPage.tsx";
import { LandingPage } from "@/pages/landing/ui/LandingPage.tsx";
import { UploadByCodePage } from "@/pages/uploadByCode/ui/UploadByCodePage.tsx";
import { DownloadByCodePage } from "@/pages/downloadByCode/ui/DownloadByCodePage.tsx";
import { useBoundStore } from "@/shared/store/useBoundStore.ts";
import { TrashPage } from "@/pages/Trash/ui/TrashPage.tsx";
import { CodePage } from "@/pages/code/ui/CodePage.tsx";
import { NotFoundPage } from "@/pages/notFound/ui/NotFoundPage.tsx";

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
    element: <UploadByCodePage />,
  },
  {
    path: "/download",
    element: <DownloadByCodePage />,
  },
  {
    path: "/c/:code",
    element: <CodePage />,
  },
  {
    path: "/Trash",
    element: <TrashPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
];

export const router = createBrowserRouter(routeTree);
