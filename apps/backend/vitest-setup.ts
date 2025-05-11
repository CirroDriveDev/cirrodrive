import "reflect-metadata";

import { config } from "@dotenvx/dotenvx";

config({
  path: "../database/.env.test",
  quiet: true,
});
