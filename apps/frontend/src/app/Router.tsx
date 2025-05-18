import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  Outlet,
} from "react-router";
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
import { MyPlanPage } from "@/pages/subscribe/myplanpage.tsx";

function GuestRoute(): JSX.Element {
  const { user } = useBoundStore();
  const location = useLocation();
  if (user) {
    return (
      <Navigate
        to={`/folder/${user.rootFolderId}`}
        state={{ from: location }}
        replace
      />
    );
  }

  return <Outlet />;
}

function UserRoute(): JSX.Element {
  const { user } = useBoundStore();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
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
        <Route element={<GuestRoute />}>
          <Route index element={<LandingPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="findpassword" element={<FindPasswordPage />} />
          <Route path="findname" element={<FindUsernamePage />} />
          <Route path="upload" element={<UploadByCodePage />} />
          <Route path="download" element={<DownloadByCodePage />} />
          <Route path="c/:code" element={<CodePage />} />
        </Route>
        <Route element={<UserRoute />}>
          <Route path="folder/:folderId" element={<FolderPage />} />
          <Route path="trash" element={<TrashPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="photos" element={<PhotosPage />} />
          <Route path="recent" element={<RecentPage />} />
          <Route path="search" element={<SearchResultsPage />} />
          <Route path="myplan" element={<MyPlanPage />} />
        </Route>
        <Route path="admin">
          <Route path="user" element={<AdminUserPage />} />
          <Route path="file" element={<AdminFilePage />} />
          <Route path="login" element={<AdminLoginPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
