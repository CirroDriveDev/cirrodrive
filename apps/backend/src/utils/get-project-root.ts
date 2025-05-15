import { resolve } from "node:path";

export function getProjectRoot(): string {
  return resolve(__dirname, "../../../../");
}
