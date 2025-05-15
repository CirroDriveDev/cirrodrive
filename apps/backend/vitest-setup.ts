import "reflect-metadata";
import { config } from "@dotenvx/dotenvx";
import { getProjectRoot } from "@/utils/get-project-root.ts";

const projectRoot = getProjectRoot();
const databasePath = `${projectRoot}/apps/database/`;
const envFilePath = `${databasePath}/../database/.env.test`;

config({
  path: envFilePath,
  quiet: true,
});
