export const parseBase64ToFile = (base64: string, fileName: string): File => {
  return new File([Buffer.from(base64, "base64")], fileName);
};
