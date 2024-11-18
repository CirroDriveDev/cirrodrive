import { createBrowserRouter, Navigate } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import { HomePage } from "@/pages/home/ui/HomePage.tsx";
import { LoginPage } from "@/pages/login/ui/LoginPage.tsx";
import { RegisterPage } from "@/pages/register/ui/RegisterPage.tsx";
import { LandingPage } from "@/pages/landing/ui/LandingPage.tsx";
import { UploadPage } from "@/pages/upload/ui/UploadPage.tsx";
import { DownloadPage } from "@/pages/download/ui/DownloadPage.tsx";
import { CodePage } from "@/pages/upload/ui/CodePage.tsx";
import { useBoundStore } from "@/shared/store/useBoundStore.ts";
import { MyInfo } from "@/pages/myinfo/ui/MyInfo.tsx";
import { MyInfoModify } from "@/pages/myinfomodify/ui/MyInfoModify.tsx";
import { EmailModify } from "@/pages/myinfomodify/ui/EmailModify.tsx";
import { IdModify } from "@/pages/myinfomodify/ui/IdModify.tsx";
import { PwModify } from "@/pages/myinfomodify/ui/PwModify.tsx";

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
    path: "/myinfo",
    element: <MyInfo />,
  },
  {
    path: "/myinfomodify",
    element: <MyInfoModify />,
  },
  {
    path: "/idmodify",
    element: <IdModify />,
  },
  {
    path: "/pwmodify",
    element: <PwModify />,
  },
  {
    path: "/emailmodify",
    element: <EmailModify />,
  },
];

export const router = createBrowserRouter(routeTree);
