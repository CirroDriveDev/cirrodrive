import { createBrowserRouter } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import { HomePage } from "@/pages/home/ui/HomePage.tsx";
import { LoginPage } from "@/pages/login/ui/LoginPage.tsx";
import { SignupPage } from "@/pages/signup/ui/SignupPage.tsx";
import { LandingPage } from "@/pages/landing/ui/LandingPage.tsx";
import { UploadPage } from "@/pages/upload/ui/UploadPage.tsx";
import { DownloadPage } from "@/pages/download/ui/DownloadPage.tsx";

const routeTree: RouteObject[] = [
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/home",
    element: <HomePage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <SignupPage />,
  },
  {
    path: "/upload",
    element: <UploadPage />,
  },
  {
    path: "/download",
    element: <DownloadPage />,
  },
];

export const router = createBrowserRouter(routeTree);
