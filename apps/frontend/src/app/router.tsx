import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  Outlet,
} from "react-router";
import { Modal } from "#components/modal/Modal.js";
import { AdminFilePage } from "#pages/admin/file.js";
import { AdminLoginPage } from "#pages/admin/login.js";
import { AdminUserPage } from "#pages/admin/user.js";
import { CodePage } from "#pages/c/[code].js";
import { DocumentsPage } from "#pages/documents.js";
import { DownloadByCodePage } from "#pages/download.js";
import { FindUsernamePage } from "#pages/findname.js";
import { FindPasswordPage } from "#pages/findpassword.js";
import { FolderPage } from "#pages/folder/[folder-id].js";
import { LandingPage } from "#pages/index.js";
import { LoginPage } from "#pages/login.js";
import { NotFoundPage } from "#pages/not-found.js";
import { PhotosPage } from "#pages/photos.js";
import { RecentPage } from "#pages/recent.js";
import { RegisterPage } from "#pages/register.js";
import { SearchResultsPage } from "#pages/search.js";
import { TrashPage } from "#pages/trash.js";
import { UploadByCodePage } from "#pages/upload.js";
import { trpc } from "#services/trpc.js";
import { useBoundStore } from "#store/useBoundStore.js";
import { MyPage } from "#pages/mypage/mypage.js";
import { AdminDashboardPage } from "#pages/admin/dashboard.js";
import { Success } from "#pages/billing/success/[plan-id].js";
import { Fail } from "#pages/billing/fail.js";
import { Subscribe } from "#pages/subscribe.js";
import { TestPage } from "#pages/test.js";
import { ChangePasswordPage } from "#pages/changspassword.js";

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
        <Route path="test" element={<TestPage />} />
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
          <Route path="mypage" element={<MyPage />} />
          <Route path="changspassword" element={<ChangePasswordPage />} />
        </Route>
        <Route path="admin">
          <Route path="user" element={<AdminUserPage />} />
          <Route path="file" element={<AdminFilePage />} />
          <Route path="login" element={<AdminLoginPage />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
        </Route>
        <Route path="subscribe">
          <Route index element={<Subscribe />} />
        </Route>
        <Route path="billing">
          <Route path="success/:planId" element={<Success />} />
          <Route path="fail" element={<Fail />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
