import { generateLink } from "#utils/generateLink.js";

export function FileUploadSuccessModal(
  fileName: string,
  code?: string,
): JSX.Element {
  const link = code ? generateLink(code) : undefined;
  return (
    <div className="flex-col text-green-500">
      <div>파일 이름: {fileName}</div>
      {code ?
        <>
          <div>코드: {code}</div>
          <div>
            링크:{" "}
            <a href={link} className="text-blue-500 hover:underline">
              {link}
            </a>
          </div>
          <div>만료일 : 1일</div>
        </>
      : null}
    </div>
  );
}
