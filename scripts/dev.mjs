import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";

import { repoRoot, stopProjectProcesses } from "./process-control.mjs";

await stopProjectProcesses({
  followParents: false
});

const commands = [
  {
    name: "backend",
    cwd: path.join(repoRoot, "apps/backend"),
    args: [path.join(repoRoot, "apps/backend/scripts/run-backend.mjs"), "dev"]
  },
  {
    name: "frontend",
    cwd: path.join(repoRoot, "apps/frontend"),
    args: [path.join(repoRoot, "apps/frontend/scripts/run-next.mjs"), "dev"]
  }
];

const children = commands.map((command) => ({
  name: command.name,
  process: spawn(process.execPath, command.args, {
    cwd: command.cwd,
    env: {
      ...process.env,
      FORCE_COLOR: process.env.FORCE_COLOR ?? "1"
    },
    stdio: "inherit"
  })
}));

let shuttingDown = false;

function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  for (const child of children) {
    child.process.kill("SIGTERM");
  }

  setTimeout(() => {
    for (const child of children) {
      if (!child.process.killed) {
        child.process.kill("SIGKILL");
      }
    }

    process.exit(exitCode);
  }, 1500).unref();
}

for (const child of children) {
  child.process.on("exit", (code, signal) => {
    if (shuttingDown) {
      return;
    }

    const exitCode = code ?? (signal ? 1 : 0);
    console.error(`Процесс ${child.name} завершился (${signal ?? exitCode}). Останавливаю остальные.`);
    shutdown(exitCode);
  });
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
