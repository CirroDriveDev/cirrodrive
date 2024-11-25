export const downloadFileFromUrl = (opts: {
  url: string;
  name: string;
}): void => {
  const a = document.createElement("a");
  a.href = opts.url;
  a.download = opts.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(opts.url);
};
