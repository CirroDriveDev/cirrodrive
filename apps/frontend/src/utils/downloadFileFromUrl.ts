export const downloadFileFromUrl = async (opts: {
  url: string;
  name: string;
  signal?: AbortSignal;
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
        if (lastProgress < 1) opts.onProgress?.(1);

        const blobUrl = URL.createObjectURL(xhr.response);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = opts.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
        resolve();
      } else {
        reject(new Error(`Download failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during download"));

    if (opts.signal) {
      opts.signal.addEventListener("abort", () => {
        xhr.abort();
        reject(new DOMException("Download aborted", "AbortError"));
      });
    }

    xhr.send();
  });
};
