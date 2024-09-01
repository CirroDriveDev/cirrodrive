import childProcess from "node:child_process";

function run(): void {
  // Run the server in development mode
  // restart the server when server exits
  // execute server.ts
  const serverProcess = childProcess.exec(
    "vite-node --watch src/server.ts | pino-pretty",
  );

  if (serverProcess.stdout === null || serverProcess.stderr === null) {
    throw new Error("Child process stdout or stderr is null");
  }

  serverProcess.stdout.pipe(process.stdout);

  serverProcess.stderr.pipe(process.stderr);

  serverProcess.on("exit", () => {
    run();
  });
}

run();
