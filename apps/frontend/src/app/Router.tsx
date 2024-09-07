import { createBrowserRouter } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import { HomePage } from "@/pages/home/ui/HomePage.tsx";
import { LoginPage } from "@/pages/login/ui/LoginPage.tsx";
import { SignupPage } from "@/pages/signup/ui/SignupPage.tsx";
import { LandingPage } from "@/pages/landing/LandingPage.tsx";

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
];

export const router = createBrowserRouter(routeTree);
