export const exampleFiles = [
  {
    id: 1,
    name: "Document1.pdf",
    size: "1.2 MB",
    date: "2024-01-01",
    type: determineFileType(getNameWithoutExtension("Document1.pdf")), // Dynamic type based on extension
  },
  {
    id: 2,
    name: "Image1.png",
    size: "2.5 MB",
    date: "2024-01-05",
    type: determineFileType(getNameWithoutExtension("Image1.png")),
  },
  {
    id: 3,
    name: "Presentation.pptx",
    size: "3.8 MB",
    date: "2024-01-10",
    type: determineFileType(getNameWithoutExtension("Presentation.pptx")),
  },
  {
    id: 4,
    name: "Test.hwp",
    size: "3.8 MB",
    date: "2024-01-10",
    type: determineFileType(getNameWithoutExtension("Test.hwp")),
  },
];

// Function to get file name without extension
function getNameWithoutExtension(filename: string): string {
  const [name, extension] = filename.split(".");
  return `${name}.${extension}`; // Include the extension
}
// Function to determine file type based on extension (same as before)
function determineFileType(filename: string): string {
  const extension = filename.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "xls":
    case "xlsx":
    case "ppt":
    case "pptx":
    case "pdf":
    case "hwp":
    case "doc":
    case "docx":
    case "txt":
      return "txt"; //문서 타입은 txt로 대충 했음
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "bmp":
    case "psd":
    case "pdd":
    case "Ai":
      return "image";
    default:
      return "unknown"; // 딱히 생각나는 것이 없어서 이쯤함
  }
}
