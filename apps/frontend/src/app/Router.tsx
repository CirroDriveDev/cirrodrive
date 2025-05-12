import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
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

export function Router(): JSX.Element {
  return (
    <BrowserRouter>
      <Modal />
      <CheckAuth />
      <Routes>
        <Route
          path="/"
          element={
            <RedirectAuthedUserToHome>
              <LandingPage />
            </RedirectAuthedUserToHome>
          }
        />
        <Route
          path="/login"
          element={
            <RedirectAuthedUserToHome>
              <LoginPage />
            </RedirectAuthedUserToHome>
          }
        />
        <Route
          path="/register"
          element={
            <RedirectAuthedUserToHome>
              <RegisterPage />
            </RedirectAuthedUserToHome>
          }
        />
        <Route path="/upload" element={<UploadByCodePage />} />
        <Route path="/download" element={<DownloadByCodePage />} />
        <Route path="/c/:code" element={<CodePage />} />
        <Route
          path="/folder/:folderId"
          element={
            <RequireAuth>
              <FolderPage />
            </RequireAuth>
          }
        />
        <Route path="/trash" element={<TrashPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/photos" element={<PhotosPage />} />
        <Route path="/recent" element={<RecentPage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/admin/user" element={<AdminUserPage />} />
        <Route path="/admin/file" element={<AdminFilePage />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/findpassword" element={<FindPasswordPage />} />
        <Route path="/findname" element={<FindUsernamePage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}
