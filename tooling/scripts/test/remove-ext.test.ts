import { removeImportExtensions } from "../src/remove-ext.js";

describe("removeImportExtensions", () => {
  test("removes .tsx extension from aliased import", () => {
    // Arrange
    const input = `import z from "#types/foo.tsx";`;
    const expected = `import z from "#types/foo";`;
    // Act
    const result = removeImportExtensions(input);
    // Assert
    expect(result).toBe(expected);
  });

  test("removes .mjs extension from export", () => {
    // Arrange
    const input = `export { a } from "./baz.mjs";`;
    const expected = `export { a } from "./baz";`;
    // Act
    const result = removeImportExtensions(input);
    // Assert
    expect(result).toBe(expected);
  });

  test("removes .cjs extension from export", () => {
    // Arrange
    const input = `export { b } from "../qux.cjs";`;
    const expected = `export { b } from "../qux";`;
    // Act
    const result = removeImportExtensions(input);
    // Assert
    expect(result).toBe(expected);
  });

  test("does not touch relative path", () => {
    // Arrange
    const input = `import x from "./foo.ts";`;
    const expected = `import x from "./foo.ts";`;
    // Act
    const result = removeImportExtensions(input);
    // Assert
    expect(result).toBe(expected);
  });

  test("does not touch unrelated strings", () => {
    // Arrange
    const input = `const s = "hello.ts";`;
    const expected = `const s = "hello.ts";`;
    // Act
    const result = removeImportExtensions(input);
    // Assert
    expect(result).toBe(expected);
  });
});
