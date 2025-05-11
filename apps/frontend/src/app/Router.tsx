import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import { useEffect } from "react";
import { AdminUserPage } from "@/pages/admin/ui/AdminUserPage.tsx";
import { AdminFilePage } from "@/pages/admin/ui/AdminFilePage.tsx";
import { LoginPage } from "@/pages/login/ui/LoginPage.tsx";
import { RegisterPage } from "@/pages/register/ui/RegisterPage.tsx";
import { LandingPage } from "@/pages/landing/ui/LandingPage.tsx";
import { UploadByCodePage } from "@/pages/uploadByCode/ui/UploadByCodePage.tsx";
import { DownloadByCodePage } from "@/pages/downloadByCode/ui/DownloadByCodePage.tsx";
import { useBoundStore } from "@/store/useBoundStore.ts";
import { TrashPage } from "@/pages/Trash/ui/TrashPage.tsx";
import { CodePage } from "@/pages/code/ui/CodePage.tsx";
import { NotFoundPage } from "@/pages/notFound/ui/NotFoundPage.tsx";
import { FolderPage } from "@/pages/folder/ui/FolderPage.tsx";
import { Modal } from "@/components/modal/Modal.tsx";
import { DocumentsPage } from "@/pages/documents/ui/DocumentsPage.tsx";
import { PhotosPage } from "@/pages/photos/ui/PhotosPage.tsx";
import { RecentPage } from "@/pages/recent/ui/RecentPage.tsx";
import { trpc } from "@/services/trpc.ts";
import { SearchResultsPage } from "@/pages/SearchResults/ui/SearchResultsPage.tsx";
import { FindPasswordPage } from "@/pages/find/ui/FindPasswordPage.tsx";
import { FindUsernamePage } from "@/pages/find/ui/FindUsernamePage.tsx";
import { AdminLoginPage } from "@/pages/admin/login/AdminLoginPage.tsx";

function RedirectAuthedUserToHome({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  const { user } = useBoundStore();
  return user ?
      <Navigate to={`/folder/${user.rootFolderId}`} replace />
    : children;
}

function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  const { user } = useBoundStore();
  return user ? children : <Navigate to="/login" replace />;
}

function CheckAuth(): React.ReactNode {
  const { user, setUser, clearUser } = useBoundStore();
  const query = trpc.session.validate.useQuery(undefined, {
    enabled: user !== null,
    refetchOnMount: user !== null,
    refetchOnReconnect: user !== null,
    refetchInterval: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (query.data) {
      setUser(query.data);
    }
    if (query.error) {
      clearUser();
    }
  }, [query.data, query.error, setUser, clearUser]);

  return null;
}

const routeTree: RouteObject[] = [
  {
    element: (
      <>
        <Modal />
        <CheckAuth />
        <Outlet />
      </>
    ),
    children: [
      {
        path: "/",
        element: (
          <RedirectAuthedUserToHome>
            <LandingPage />
          </RedirectAuthedUserToHome>
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
        path: "/folder/:folderId",
        element: (
          <RequireAuth>
            <FolderPage />
          </RequireAuth>
        ),
      },
      {
        path: "/trash",
        element: <TrashPage />,
      },
      {
        path: "/documents",
        element: <DocumentsPage />,
      },
      {
        path: "/photos",
        element: <PhotosPage />,
      },
      {
        path: "/recent",
        element: <RecentPage />,
      },
      {
        path: "/search",
        element: <SearchResultsPage />,
      },
      {
        path: "/admin/user",
        element: <AdminUserPage />,
      },
      {
        path: "/admin/file",
        element: <AdminFilePage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
      {
        path: "/findpassword",
        element: <FindPasswordPage />,
      },
      {
        path: "/findname",
        element: <FindUsernamePage />,
      },
      {
        path: "/admin/login",
        element: <AdminLoginPage />,
      },
    ],
  },
];

export const router = createBrowserRouter(routeTree);
