export function selectFile(): Promise<FileList | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;

    input.addEventListener("change", () => {
      resolve(input.files);
    });

    input.click();
  });
}
