export interface PresignedPostData {
  url: string;
  fields: Record<string, string>;
}

export async function uploadWithPresignedPost(
  file: File,
  presignedPost: PresignedPostData,
): Promise<void> {
  const formData = new FormData();
  Object.entries(presignedPost.fields).forEach(([key, value]) => {
    formData.append(key, value);
  });
  formData.append("file", file);

  const response = await fetch(presignedPost.url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`S3 업로드 실패: ${response.status} ${text}`);
  }
}
