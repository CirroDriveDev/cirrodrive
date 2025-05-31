export const downloadFileFromUrl = async (opts: {
  url: string;
  name: string;
  onProgress?: (progress: number) => void;
}): Promise<void> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", opts.url, true);
    xhr.responseType = "blob";
    let lastProgress = 0;
    xhr.onprogress = (event) => {
      if (event.lengthComputable) {
        lastProgress = event.loaded / event.total;
        opts.onProgress?.(lastProgress);
      }
    };
    xhr.onload = () => {
      if (xhr.status === 200) {
        // 다운로드 완료 시 100% 콜백 보장
        if (lastProgress < 1) {
          opts.onProgress?.(1);
        }
        const url = URL.createObjectURL(xhr.response as Blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = opts.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        resolve();
      } else {
        reject(new Error(`Download failed: ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send();
  });
};
