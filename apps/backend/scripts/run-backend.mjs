import net from "node:net";
import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, "..");
const mode = process.argv[2] ?? "dev";
const port = 8000;

function isPortFree(portToCheck) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(portToCheck, "0.0.0.0");
  });
}

if (!(await isPortFree(port))) {
  console.error(
    "Порт 8000 уже занят. Остановите старый backend через `pnpm dev:stop` и запустите проект снова."
  );
  process.exit(1);
}

const command =
  mode === "dev"
    ? [
        path.join(appRoot, "node_modules", "tsx", "dist", "cli.mjs"),
        "watch",
        "src/main.ts"
      ]
    : [path.join(appRoot, "dist", "main.js")];

const child = spawn(process.execPath, command, {
  cwd: appRoot,
  env: {
    ...process.env,
    PORT: String(port)
  },
  stdio: "inherit"
});

let shuttingDown = false;

function shutdown(signal) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  if (!child.killed) {
    child.kill(signal);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

child.on("error", (error) => {
  console.error("Не удалось запустить backend:", error);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) {
    if (!shuttingDown) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(0);
    return;
  }

  process.exit(code ?? 0);
});
