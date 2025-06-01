import { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { z } from "zod";
import { FolderView } from "#components/FolderView.js";

interface FolderPageParams extends Record<string, string> {
  folderId: string;
}

export function FolderPage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { folderId: rawFolderId } = useParams<FolderPageParams>();

  const { data: folderId, error } = z.coerce.string().safeParse(rawFolderId);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const alreadyRefreshed = searchParams.get("refreshed");

    if (!alreadyRefreshed) {
      // refreshed 쿼리 파라미터 추가 후 새로고침
      searchParams.set("refreshed", "true");
      void navigate(`${location.pathname}?${searchParams.toString()}`, {
        replace: true,
      });
      window.location.reload();
    }
  }, [location, navigate]);

  if (error) {
    return <div>Invalid folder ID</div>;
  }

  return <FolderView folderId={folderId} />;
}
