import { execFileSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const repoRoot = path.resolve(__dirname, "..");
export const frontendRoot = path.join(repoRoot, "apps", "frontend");
export const backendRoot = path.join(repoRoot, "apps", "backend");
export const appPorts = [3000, 8000];
const trackedCommands = [
  "scripts/dev.mjs",
  "scripts/run-next.mjs",
  "scripts/run-backend.mjs",
  "next/dist/bin/next",
  "next dev",
  "next start",
  "next-server",
  "tsx watch src/main.ts",
  "dist/main.js"
];
const managedProcessTokens = [
  "node",
  "pnpm",
  "next",
  "tsx",
  "turbo",
  "prisma",
  "vitest"
];

function execOutput(file, args) {
  try {
    return execFileSync(file, args, {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    });
  } catch (error) {
    if (typeof error?.stdout === "string") {
      return error.stdout;
    }

    return "";
  }
}

function parseNumericLines(output) {
  return output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => Number(line))
    .filter((value) => Number.isInteger(value) && value > 0);
}

function readProcessInfo(pid) {
  const psOutput = execOutput("ps", ["-p", String(pid), "-o", "pid=,ppid=,command="]).trim();

  if (!psOutput) {
    return null;
  }

  const match = psOutput.match(/^\s*(\d+)\s+(\d+)\s+([\s\S]+)$/);

  if (!match) {
    return null;
  }

  const cwdOutput = execOutput("lsof", ["-a", "-p", String(pid), "-d", "cwd", "-Fn"]);
  const cwdMatch = cwdOutput.match(/\nn([^\n]+)/);

  return {
    pid: Number(match[1]),
    ppid: Number(match[2]),
    command: match[3].trim(),
    cwd: cwdMatch ? cwdMatch[1].trim() : ""
  };
}

function isManagedProcess(processInfo) {
  if (!processInfo) {
    return false;
  }

  return managedProcessTokens.some((token) => processInfo.command.includes(token));
}

function isProjectProcess(processInfo, { scopeRoot = repoRoot, commandFragments = trackedCommands } = {}) {
  if (!processInfo) {
    return false;
  }

  if (!isManagedProcess(processInfo)) {
    return false;
  }

  if (processInfo.cwd.startsWith(scopeRoot)) {
    return true;
  }

  if (processInfo.command.includes(scopeRoot)) {
    return true;
  }

  return commandFragments.some((fragment) => processInfo.command.includes(fragment));
}

function collectListeningPids(ports) {
  const pids = new Set();

  for (const port of ports) {
    const output = execOutput("lsof", ["-tiTCP:" + String(port), "-sTCP:LISTEN"]);

    for (const pid of parseNumericLines(output)) {
      pids.add(pid);
    }
  }

  return pids;
}

function collectKnownDevPids(commandFragments = trackedCommands) {
  if (commandFragments.length === 0) {
    return new Set();
  }

  const output = execOutput("pgrep", ["-f", commandFragments.join("|")]);

  return new Set(parseNumericLines(output));
}

function collectRelatedPids(seedPids, {
  scopeRoot = repoRoot,
  commandFragments = trackedCommands,
  followParents = false
} = {}) {
  const related = new Set();
  const queue = [...seedPids];
  const visited = new Set();

  while (queue.length > 0) {
    const pid = queue.shift();

    if (!pid || visited.has(pid) || pid === process.pid) {
      continue;
    }

    visited.add(pid);

    const processInfo = readProcessInfo(pid);

    if (!isProjectProcess(processInfo, { scopeRoot, commandFragments })) {
      continue;
    }

    related.add(pid);

    if (followParents && processInfo.ppid > 1) {
      queue.push(processInfo.ppid);
    }
  }

  return [...related].sort((left, right) => right - left);
}

function killPid(pid, signal) {
  try {
    process.kill(pid, signal);
    return true;
  } catch {
    return false;
  }
}

function isAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function sleep(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function stopDockerInfra(logger) {
  const hasDocker = execOutput("which", ["docker"]).trim().length > 0;

  if (!hasDocker) {
    return;
  }

  const projectStatus = execOutput("docker", [
    "compose",
    "-f",
    path.join("infra", "docker", "compose.yml"),
    "ps",
    "--status",
    "running",
    "--services"
  ]).trim();

  if (!projectStatus) {
    return;
  }

  logger.log("Останавливаю docker-compose сервисы проекта.");
  execOutput("docker", [
    "compose",
    "-f",
    path.join("infra", "docker", "compose.yml"),
    "down",
    "--remove-orphans"
  ]);
}

export async function stopProjectProcesses({
  ports = appPorts,
  scopeRoot = repoRoot,
  commandFragments = trackedCommands,
  includeKnownDev = true,
  followParents = false,
  includeInfra = false,
  logger = console
} = {}) {
  const seedPids = new Set([
    ...collectListeningPids(ports),
    ...(includeKnownDev ? collectKnownDevPids(commandFragments) : [])
  ]);
  const pids = collectRelatedPids(seedPids, {
    scopeRoot,
    commandFragments,
    followParents
  });

  if (pids.length === 0 && !includeInfra) {
    logger.log("Активных процессов приложения на портах проекта не найдено.");
    return;
  }

  if (pids.length > 0) {
    logger.log(`Останавливаю процессы проекта: ${pids.join(", ")}`);
  }

  for (const pid of pids) {
    killPid(pid, "SIGTERM");
  }

  await sleep(1200);

  const alive = pids.filter(isAlive);

  if (alive.length > 0) {
    logger.log(`Принудительно завершаю процессы: ${alive.join(", ")}`);

    for (const pid of alive) {
      killPid(pid, "SIGKILL");
    }
  }

  if (includeInfra) {
    await stopDockerInfra(logger);
  }
}
