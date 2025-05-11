import { useEffect } from "react";
import type { RouteObject } from "react-router-dom";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { Modal } from "@/components/modal/Modal.tsx";
import { AdminFilePage } from "@/pages/admin/file.tsx";
import { AdminLoginPage } from "@/pages/admin/login.tsx";
import { AdminUserPage } from "@/pages/admin/user.tsx";
import { CodePage } from "@/pages/c/[code].tsx";
import { DocumentsPage } from "@/pages/documents.tsx";
import { DownloadByCodePage } from "@/pages/download.tsx";
import { FindUsernamePage } from "@/pages/findname.tsx";
import { FindPasswordPage } from "@/pages/findpassword.tsx";
import { FolderPage } from "@/pages/folder/[folder-id].tsx";
import { LandingPage } from "@/pages/index.tsx";
import { LoginPage } from "@/pages/login.tsx";
import { NotFoundPage } from "@/pages/not-found.tsx";
import { PhotosPage } from "@/pages/photos.tsx";
import { RecentPage } from "@/pages/recent.tsx";
import { RegisterPage } from "@/pages/register.tsx";
import { SearchResultsPage } from "@/pages/search.tsx";
import { TrashPage } from "@/pages/trash.tsx";
import { UploadByCodePage } from "@/pages/upload.tsx";
import { trpc } from "@/services/trpc.ts";
import { useBoundStore } from "@/store/useBoundStore.ts";

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
