import { describe, it, expect } from "vitest";
import { generateSafeFileName } from "@/utils/generate-safe-file-name.ts";

describe("generateSafeFileName", () => {
  it("should sanitize file names by replacing path separators", () => {
    const result = generateSafeFileName({
      fileName: "folder/subfolder/file.txt",
      existingNames: [],
    });
    expect(result).toBe("folder_subfolder_file.txt");
  });

  it("should sanitize file names by replacing special characters", () => {
    const result = generateSafeFileName({
      fileName: 'f\\i/l:e*n?a"m<e>t|est.txt',
      existingNames: [],
    });
    expect(result).toBe("f_i_l_e_n_a_m_e_t_est.txt");
  });

  it("should return the same name if it does not exist in existingNames", () => {
    const result = generateSafeFileName({
      fileName: "file.txt",
      existingNames: ["other_file.txt", "file (1).txt"],
    });
    expect(result).toBe("file.txt");
  });

  it("should append a counter to the file name if it already exists", () => {
    const result = generateSafeFileName({
      fileName: "file.txt",
      existingNames: ["file.txt"],
    });
    expect(result).toBe("file (1).txt");
  });

  it("should increment the counter until a unique name is found", () => {
    const result = generateSafeFileName({
      fileName: "file.txt",
      existingNames: ["file.txt", "file (1).txt", "file (2).txt"],
    });
    expect(result).toBe("file (3).txt");
  });

  it("should handle file names with existing counters correctly", () => {
    const result = generateSafeFileName({
      fileName: "file (1).txt",
      existingNames: ["file.txt", "file (1).txt", "file (2).txt"],
    });
    expect(result).toBe("file (3).txt");
  });

  it("should handle file names without extensions", () => {
    const result = generateSafeFileName({
      fileName: "file",
      existingNames: ["file", "file (1)", "file (2)"],
    });
    expect(result).toBe("file (3)");
  });
});
