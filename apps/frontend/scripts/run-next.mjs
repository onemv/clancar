import net from "node:net";
import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, "..");
const nextBin = path.join(appRoot, "node_modules", "next", "dist", "bin", "next");
const mode = process.argv[2] ?? "dev";
const port = 3000;
const nextArgs = [nextBin, mode];

if (mode === "dev") {
  // В dev используем Turbopack. На текущем проекте webpack-runtime периодически
  // падал при изменениях SCSS с клиентской ошибкой removeChild/null.
  nextArgs.push("--turbopack");
}

nextArgs.push("--hostname", "0.0.0.0", "--port", String(port));

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
    "Порт 3000 уже занят. Остановите старый frontend через `pnpm dev:stop` и запустите проект снова."
  );
  process.exit(1);
}

const child = spawn(
  process.execPath,
  nextArgs,
  {
    cwd: appRoot,
    env: {
      ...process.env,
      PORT: String(port)
    },
    stdio: "inherit"
  }
);

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
  console.error("Не удалось запустить frontend:", error);
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
